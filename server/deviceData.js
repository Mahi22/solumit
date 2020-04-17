const pg = require("pg");
const QueryStream = require("pg-query-stream");
const { fromNodeStream } = require("ix/asynciterable/fromnodestream");
const { toArray } = require("ix/asynciterable");
const { map } = require("ix/asynciterable/operators");
const moment = require("moment");
const math = require("mathjs");
const db = require("./db");

const multiplyNumbers = (a, b) => {
  try {
    return math.round(math.multiply(a, b));
  } catch (err) {
    return 0;
  }
};

function deviceData(deviceId, forDate) {
  const utcOffsetDate = moment(forDate).utcOffset("+5:30");

  const queryBuilder = db(`device${deviceId}`)
    .select("*")
    .whereBetween("fortime", [
      utcOffsetDate.startOf("day").toISOString(),
      utcOffsetDate.endOf("day").toISOString()
    ])
    .orderBy("fortime", "asc");
  const client = new pg.Client(queryBuilder.client.connectionSettings);
  client.connect();
  const { sql, bindings } = queryBuilder.toSQL().toNative();
  console.log(new Date().toISOString(), sql, bindings);
  const stream = new QueryStream(sql, bindings, {
    highWaterMark: 100,
    batchSize: 50
  });
  client.query(stream);

  const max = {
    output: 0,
    mains: 0,
    solar: 0
  };

  const mulMax = maxFor => (a, b) => {
    const result = multiplyNumbers(a, b);
    max[maxFor] = max[maxFor] <= result ? result : max[maxFor];
    return result;
  };

  const streamData = fromNodeStream(stream).pipe(
    map(({ fortime, ups_opv, ups_lt, pfc_vb, pfc_io, mp1_vb, mp1_io }) => ({
      fortime,
      output: mulMax("output")(ups_opv, ups_lt),
      mains: mulMax("mains")(pfc_vb, pfc_io),
      solar: mulMax("solar")(mp1_vb, mp1_io)
    }))
  );

  return toArray(streamData).then(values => ({
    max,
    values
  }));
}

module.exports = deviceData;
