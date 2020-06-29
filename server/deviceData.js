const pg = require("pg");
const QueryStream = require("pg-query-stream");
const { fromNodeStream } = require("ix/asynciterable/fromnodestream");
const { toArray } = require("ix/asynciterable");
const { map, tap } = require("ix/asynciterable/operators");
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

function deviceDayData(deviceId, forDate) {
  console.log(forDate);
  const utcOffsetDate = moment(forDate);

  const queryBuilder = db(`device${deviceId}`)
    .select(
      db.raw(
        `time_bucket('2 hours', fortime) as index, avg(ups_opv) as ups_opv, avg(ups_lt) as ups_lt, avg(pfc_vb) as pfc_vb, avg(pfc_io) as pfc_io, avg(mp1_vb) as mp1_vb, avg(pfc_io) as pfc_io, avg(mp1_vb) as mp1_vb, avg(mp1_io)  as mp1_io, sum(ups_opv * ups_lt * 30 / 3600000) as energy`
      )
    )
    .whereBetween("fortime", [
      utcOffsetDate.startOf("day").toISOString(),
      utcOffsetDate.endOf("day").toISOString()
    ])
    .groupBy("index")
    .orderBy("index");

  const client = new pg.Client(queryBuilder.client.connectionSettings);
  client.connect();
  const { sql, bindings } = queryBuilder.toSQL().toNative();
  const stream = new QueryStream(sql, bindings, {
    highWaterMark: 100,
    batchSize: 50
  });
  client.query(stream);

  const streamData = fromNodeStream(stream).pipe(
    // tap(console.log),
    map(
      ({ index, ups_opv, ups_lt, pfc_vb, pfc_io, mp1_vb, mp1_io, energy }) => ({
        fortime: moment(index)
          .add(30, "minutes")
          .utcOffset("+5:30"),
        // fortime: index,
        energy, // (multiplyNumbers(ups_opv, ups_lt) * 30 * 240) / 3600000,
        output: multiplyNumbers(ups_opv, ups_lt),
        mains: multiplyNumbers(pfc_vb, pfc_io),
        solar: multiplyNumbers(mp1_vb, mp1_io)
      })
    )
  );

  return toArray(streamData);
}

function deviceWeekData(deviceId, forDate) {
  const utcOffsetDate = moment(forDate);

  const queryBuilder = db(`device${deviceId}`)
    .select(
      db.raw(
        `time_bucket('1 day', fortime) as index, avg(ups_opv) as ups_opv, avg(ups_lt) as ups_lt, avg(pfc_vb) as pfc_vb, avg(pfc_io) as pfc_io, avg(mp1_vb) as mp1_vb, avg(pfc_io) as pfc_io, avg(mp1_vb) as mp1_vb, avg(mp1_io)  as mp1_io, sum(ups_opv * ups_lt * 30 / 3600000) as energy`
      )
    )
    .whereBetween("fortime", [
      utcOffsetDate.startOf("day").toISOString(),
      utcOffsetDate
        .add(7, "days")
        .endOf("day")
        .toISOString()
    ])
    .groupBy("index")
    .orderBy("index");

  const client = new pg.Client(queryBuilder.client.connectionSettings);
  client.connect();
  const { sql, bindings } = queryBuilder.toSQL().toNative();
  const stream = new QueryStream(sql, bindings, {
    highWaterMark: 100,
    batchSize: 50
  });
  client.query(stream);

  const streamData = fromNodeStream(stream).pipe(
    // tap(console.log),
    map(
      ({ index, ups_opv, ups_lt, pfc_vb, pfc_io, mp1_vb, mp1_io, energy }) => ({
        fortime: moment(index),
        // .add(30, "minutes")
        // .utcOffset("+5:30"),
        // fortime: index,
        energy, // : (multiplyNumbers(ups_opv, ups_lt) * 30 * 120 * 24) / 3600000,
        output: multiplyNumbers(ups_opv, ups_lt),
        mains: multiplyNumbers(pfc_vb, pfc_io),
        solar: multiplyNumbers(mp1_vb, mp1_io)
      })
    )
  );

  return toArray(streamData);
}

function deviceMonthData(deviceId, forDate) {
  const monthStart = moment(forDate).startOf("month");
  const monthEnd = moment(forDate).endOf("month");
  // const days = monthEnd.diff(monthStart, "days") + 1;

  const queryBuilder = db(`device${deviceId}`)
    .select(
      db.raw(
        `time_bucket('1 day', fortime) as index, avg(ups_opv) as ups_opv, avg(ups_lt) as ups_lt, avg(pfc_vb) as pfc_vb, avg(pfc_io) as pfc_io, avg(mp1_vb) as mp1_vb, avg(pfc_io) as pfc_io, avg(mp1_vb) as mp1_vb, avg(mp1_io)  as mp1_io, sum(ups_opv * ups_lt * 30 / 3600000) as energy`
      )
    )
    .whereBetween("fortime", [monthStart.toISOString(), monthEnd.toISOString()])
    .groupBy("index")
    .orderBy("index");

  const client = new pg.Client(queryBuilder.client.connectionSettings);
  client.connect();
  const { sql, bindings } = queryBuilder.toSQL().toNative();
  const stream = new QueryStream(sql, bindings, {
    highWaterMark: 100,
    batchSize: 50
  });
  client.query(stream);

  const streamData = fromNodeStream(stream).pipe(
    // tap(console.log),
    map(
      ({ index, ups_opv, ups_lt, pfc_vb, pfc_io, mp1_vb, mp1_io, energy }) => ({
        fortime: moment(index),
        // .add(30, "minutes")
        // .utcOffset("+5:30"),
        // fortime: index,
        energy, // (multiplyNumbers(ups_opv, ups_lt) * 30 * 120 * 24) / 3600000,
        output: multiplyNumbers(ups_opv, ups_lt),
        mains: multiplyNumbers(pfc_vb, pfc_io),
        solar: multiplyNumbers(mp1_vb, mp1_io)
      })
    )
  );

  return toArray(streamData);
}

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
    })),
    tap(console.log)
  );

  return toArray(streamData).then(values => ({
    max,
    values
  }));
}

module.exports = {
  deviceData,
  deviceDayData,
  deviceWeekData,
  deviceMonthData
};
