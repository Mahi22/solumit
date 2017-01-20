const config = require('../config');
const Device = require('../models/device');
const jwt = require('jwt-simple');
const moment = require('moment');

function tokenForUser(device) {
  const timestamp = new Date().getTime();
  return jwt.encode({ sub: device.imei, iat: timestamp }, config.secret);
}

function decodeToken(token) {
  return jwt.decode(token, config.secret);
}

exports.createdevice = function (req, res, next) {
  const {
    imei, address, latitude, longitude, username, calculateFromDate
  } = req.body;

  if(imei) {

    Device.create({
      imei, address, latitude, longitude, username, calculateFromDate
    }).then(device => {
      res.send({ token: tokenForUser(device.dataValues) });
    })
    .catch((err) => {
      console.log(err);
      res.send('Could not post in database');
    })
  } else {
    res.send('Invalid parameters send');
  }
}

exports.newTokenGenerate = function (req, res, next) {
  const {
    imei, username
  } = req.body;

  if(imei && username) {
    Device.findOne({ where: {imei} })
    .then(device => {
      res.send({ token: tokenForUser(device.dataValues) });
    })
  } else {
    res.send('Invalid parameters send');
  }
}

exports.createuser = function (req, res, next) {
  const {
    token, email, password
  } = req.body;

  const {sub, iat} = decodeToken(token);

  // console.log(moment().diff(iat, 'minutes'));

  if (sub && moment().diff(iat, 'days') < 2) {
    Device.findOne({
      where: {
        imei: sub
      }
    }).then( device => {
      if (device.users < 5) {
        return device.createUser({
            email,
            password
        });
      } else {
        res.send('maxusers');
      }
    })
    .then( device => {
      device.increment('users');
      res.send({ token: tokenForUser(device.dataValues), email });
    })
    .catch(err => {
      if (err.errors[0].message === 'email must be unique') {
        res.send('emailInUse');
      }
      res.send('error');
    });
  } else {
    res.send('Invalid Token');
  }
}

exports.overallData = function (req, res, next) {
  const {imei} = req.query;

  Device.findOne({
    where: {
      imei
    }
  }).then( device => {
    const { solarUnits, gridUnits, totalUnits, solarPotentialLost } = device;
    res.send({ solarUnits, gridUnits, totalUnits, solarPotentialLost });
  })
  .catch(err => {
    res.send('Some Error faced');
  });
}
