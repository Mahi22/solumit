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
    imei, address, latitude, longitude, username
  } = req.body;

  if(imei) {

    Device.create({
      imei, address, latitude, longitude, username
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

  console.log(moment().diff(iat, 'minutes'));

  if (sub && moment().diff(iat, 'days') < 1) {
    Device.findOne({
      where: {
        imei: sub
      }
    }).then( device => device.createUser({
        email,
        password
      }))
    .then( user => {
      res.send('success');
    })
    .catch(err => {
      if (err.errors[0].message === 'email must be unique') {
        res.send('Email already in use');
      }
      res.send('Some Error faced');
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
    const { solarUnits, gridUnits, totalUnits } = device;
    res.send({ solarUnits, gridUnits, totalUnits });
  })
  .catch(err => {
    res.send('Some Error faced');
  });
}
