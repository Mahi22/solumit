const Value = require('../models/value');
const Device = require('../models/device');
const moment = require('moment');


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
    });

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

exports.dayToken = function (req, res, next) {
  // const {imei, date} = req.query;
  const imei = req.user.dataValues.imei;
  const date = req.body.date;

  console.log('CALLING DAY TOKEN', imei, date);

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

exports.overallData = function (req, res, next) {
  const {imei, date} = req.query;

  let solarUnits = 0,
      gridUnits = 0,
      totalUnits = 0;

  let solarPotentialLost = 0;

  Value.findAll({
    where: {
      imei
    }
  }).then( values => {

    values.forEach((d, index) => {

      if (moment(date, 'YY/MM/DD').diff(moment(d.timestamp, 'YY/MM/DD,hh:mm:ss'), 'minutes') < 0){
        if (parseInt(d.PC) >= 5) {
          if (!isNaN(parseInt(d.IV)) && !isNaN(parseInt(d.IR)) && !isNaN(parseInt(d.IY)) && !isNaN(parseInt(d.IB))) {
            totalUnits += ((parseInt(d.IV) * (parseInt(d.IR) + parseInt(d.IY) + parseInt(d.IB))) / 1000);
          }

          if (!isNaN(parseInt(d.PV)) && !isNaN(parseInt(d.PC))) {
            solarUnits += (parseInt(d.PV) * parseInt(d.PC)) / 1000;
          }

          if (!isNaN(parseInt(d.GV)) && !isNaN(parseInt(d.GC))) {
            gridUnits += (d.GV * d.GC) / 1000;
          }
        } else {
          solarPotentialLost += 1;
        }
      }
    });

    totalUnits = (totalUnits / 60).toFixed(2);
    solarUnits = (solarUnits / 60).toFixed(2);
    gridUnits = (gridUnits / 60).toFixed(2);

    // res.send({totalUnits, solarUnits, gridUnits});
    Device.update(
      { solarUnits, gridUnits, totalUnits, solarPotentialLost },
      { where: { imei } }
    )
    .then(result => {
      res.send('Updated');
    })
    .catch((err) => {
      res.send(err);
    });
  });
}

exports.overallDataCronJob = function () {

  function buildData(imei, date) {
    let solarUnits = 0,
        gridUnits = 0,
        totalUnits = 0,
        solarPotentialLost = 0;

    Value.findAll({
      where: {
        imei
      }
    }).then( values => {

      values.forEach((d, index) => {
        if (moment(date, 'YY/MM/DD').diff(moment(d.timestamp, 'YY/MM/DD,hh:mm:ss'), 'minutes') < 0 ){
          if (parseInt(d.PC) >= 5) {
            if (!isNaN(parseInt(d.IV)) && !isNaN(parseInt(d.IR)) && !isNaN(parseInt(d.IY)) && !isNaN(parseInt(d.IB))) {
              totalUnits += ((parseInt(d.IV) * (parseInt(d.IR) + parseInt(d.IY) + parseInt(d.IB))) / 1000);
            }

            if (!isNaN(parseInt(d.PV)) && !isNaN(parseInt(d.PC))) {
              solarUnits += (parseInt(d.PV) * parseInt(d.PC)) / 1000;
            }

            if (!isNaN(parseInt(d.GV)) && !isNaN(parseInt(d.GC))) {
              gridUnits += (d.GV * d.GC) / 1000;
            }
          } else {
            solarPotentialLost += 1;
          }
        }
      });

      totalUnits = (totalUnits / 60).toFixed(2);
      solarUnits = (solarUnits / 60).toFixed(2);
      gridUnits = (gridUnits / 60).toFixed(2);

      Device.update(
        { solarUnits, gridUnits, totalUnits, solarPotentialLost },
        { where: { imei } }
      )
      .then(result => {
        console.log('Updated');
      })
      .catch((err) => {
        console.log(err);
      });
    });
  }


  Device.findAll()
  .then( devices => {
    devices.forEach(device => {
      buildData(device.dataValues.imei, device.dataValues.calculateFromDate);
    })
  });
}
