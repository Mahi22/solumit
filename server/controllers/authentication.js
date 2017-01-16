const config = require('../config');
const jwt = require('jwt-simple');
const User = require('../models/user');
const Device = require('../models/device');

function tokenForUser(user, imei) {
  const timestamp = new Date().getTime();
  return jwt.encode({ sub: user.id, iat: timestamp, imei  }, config.secret);
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
  Device.findAll({
    where : {
      userId : req.user.id
    }
  })
  .then( devices => {
    if (devices) {
      if (devices.length === 1) {
        res.send({ status: true, token: tokenForUser(req.user, devices[0].imei)});
      }else {
        res.send({ status: true, message: 'currently no multiple devices supported' });
      }
    } else {

    }
  });

};

exports.signintoken = function (req, res, next) {
  console.log(req.user.dataValues);
  if (req.user) {
    res.send({email: req.user.dataValues.email});
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
