const config = require('../config');
const jwt = require('jwt-simple');
const User = require('../models/user');

function tokenForUser(user) {
  const timestamp = new Date().getTime();
  return jwt.encode({ sub: user.id, iat: timestamp }, config.secret);
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
  res.send({ token: tokenForUser(req.user) });
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
