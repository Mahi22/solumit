const Value = require('../models/value');

exports.collect = function (req, res, next) {
  const {
    imei,timestamp,PV,PI,GV,GR,GY,GB,IV,IR,IY,IB
  } = req.body;

  if(imei && timestamp) {
    Value.create({
      imei,timestamp,PV,PI,GV,GR,GY,GB,IV,IR,IY,IB
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
