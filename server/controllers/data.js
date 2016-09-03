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
  res.send('recieved data');
}
