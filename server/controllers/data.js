const Value = require('../models/value');

exports.collect = function (req, res, next) {
  const {
    imei,timestamp,data
  } = req.body;

  if(imei && timestamp) {
    const arr = data.match(/.{1,3}/g);
    const GV = arr[0],
          GC = arr[1],
          PV = arr[2],
          PC = arr[3],
          IV = arr[4],
          IR = arr[5],
          IY = arr[6],
          IB = arr[7];

    Value.create({
      imei,timestamp, GV, GC, PV, PC, IV, IR, IY, IB, data
    }).then(value => {
      console.log(value);
      res.send('successfully posted');
    })
    .catch((err) => {
      console.log(err);
      res.send('Could not post in database');
    })
  }

}

exports.newCollect = function (req, res, next) {
  console.log(req.body);
  const {
    imei, timestamp, data
  } = req.body;

  // Data values for data stringValues

  // 0-2 = GV grid
  // 3-5 = GI grid   decimal with points on units place eg: 00.1
  // 6-8 = PV solar
  // 9-11 = PI solar decimal with points on units place eg: 00.1
  // 12-14 = OV output
  // 15-17 = OR output decimanl with points on units place
  // 18-20 = OY "-"
  // 21-23 = OB "-"
}

exports.dayData = function (req, res, next) {
  const {imei, date} = req.query;

  Value.findAll({
    where: {
      imei,
      timestamp: {
        $like: `${date}%`
      }
    }
  }).then( values => {
    return res.send(values);
  });
}

exports.allData = function (req, res, next) {
  const {imei, date} = req.query;

  Value.findAll({
    where: {
      imei
    }
  }).then( values => {
    return res.send(values);
  });
}
