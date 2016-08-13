const config = require('../config');
const ExtractJwt = require('passport-jwt').ExtractJwt;
const JwtStrategy = require('passport-jwt').Strategy;
const LocalStrategy = require('passport-local');
const passport = require('passport');
const User = require('../models/user');

//Create a local strategy
const localOptions = { usernameField: 'email' };
const localLogin = new LocalStrategy(localOptions, function (email, password, done) {
  //Verify this username and password, call done with user
  //if it is the correct email and password
  //otherwise call done with false
  // User.findOne({ email: email }, function (err, user) {
  //   if (err) { return done(err); }
  //
  //   if (!user) { return done(null, false); }
  //
  //   //compare passwords - is `password` equal to user.password?
  //   user.comparePassword(password, function (err, isMatch) {
  //     if (err) { return done(err); }
  //
  //     if (!isMatch) { return done(null, false); }
  //
  //     return done(null, user);
  //   });
  // });

  User.findOne({ where: { email } })
  .then(function(user) {
    if(!user) {
      console.log('Could Not find User');
      return done(null, false);
    }

    user.comparePassword(password, function(err, isMatch) {
        if(err) { return done(err); }

        if(!isMatch) { return done(null, false); }

        return done(null, user.dataValues);
    });

  })
  .catch(function(err) {
    return done(err);
  });
});

//Setup options for JWT Strategy
const jwtOptions = {
  jwtFromRequest: ExtractJwt.fromHeader('authorization'),
  secretOrKey: config.secret,
};

//Create JWT stragtegy
const jwtLogin = new JwtStrategy(jwtOptions, function (payload, done) {
    //See if the user ID in the payload exists in our database
    //If it does,  call 'done' with that user
    //otherwise, call done without a user object
    User.findById(payload.sub, function (err, user) {
      if (err) { return done(err, false); }

      if (user) {
        done(null, user);
      } else {
        done(null, false);
      }
    });
  });

//Tell passport to use this Strategy
passport.use(jwtLogin);
passport.use(localLogin);
