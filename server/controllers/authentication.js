const config = require('../config');
const jwt = require('jwt-simple');
const User = require('../models/user');
const Device = require('../models/device');

function tokenForUser(user, imei) {
  const timestamp = new Date().getTime();
  return jwt.encode({ sub: user.id, iat: timestamp, imei, logins: user.logins  }, config.secret);
}

exports.test = function (req, res, next) {
  //testing values
  const email = req.body.email;
  const password = req.body.password;


  res.send('thanks');
}

exports.signin = function (req, res, next) {
  //User here had already had their email and password auth'd
  //we just need to give them token

  // const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;

  Device.findOne({
    where : {
      imei : req.user.imei
    }
  })
  .then( device => {
    if (device) {
      res.send({ status: true, email: req.user.email, token: tokenForUser(req.user, device.imei), username: device.username, calibratedDate: device.calculateFromDate, startDate: device.startDate});
    } else {
      res.send({ status: false, message: 'could not find user' });
    }
  });

};

exports.signintoken = function (req, res, next) {

  if (req.user) {
    // res.send({email: req.user.dataValues.email});

    // req.user.increment("logins");
    Device.findOne({
      where : {
        imei : req.user.dataValues.imei
      }
    })
    .then( device => {
      if (device) {
        res.send({ status: true, email: req.user.dataValues.email, token: tokenForUser(req.user, device.imei), username: device.username, calibratedDate: device.calculateFromDate, startDate: device.startDate});
      } else {
        res.send({ status: false, message: 'could not find user' });
      }
    })
    .catch(function (error) {
      if(error) {
        res.status(422).send({ error: 'Some Error in database entry, Please contact the provider'});
      }
    });

  }else {
    res.send("no success");
  }

}

exports.checkemail = function (req, res, next) {
  const email = req.body.email;

  User.findOne({  where: {email} })
  .then(function(user) {

    if (user) {
      res.json({ status: true, message: 'success' });
    } else {
      res.status(422).send({ status: false, message: 'not found' });
    }

  }).catch(function (error) {
    if(error) {
      res.status(422).send({ error: 'Some Error in database entry, Please contact the provider'});
    }
  });
};

exports.signup = function (req, res, next) {
  const email = req.body.email;
  const password = req.body.password;

  // See if a user with the given email exists
  User.findOne({  where: {email} })
  .then(function(user) {

    // If a user with email does exist, return a Error
    if(user) {
      res.status(422).send({ error: 'Email is in use' });
    } else {
      // If a user with email does NOT exist, create and save user record
      User.create({ email, password })
      .then(function(user) {
        // Respond to request indicating the user was created
        res.json({ token: tokenForUser(user.dataValues) });
      });
    }
  })
  .catch(function (error) {
    if(error) {
      res.status(422).send({ error: 'Some Error in database entry, Please contact the provider'});
    }
  });
};

exports.signout = function (req, res, next) {
  res.send('Success');
}
