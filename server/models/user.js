const bcrypt = require('bcrypt-nodejs');
const Sequelize = require('sequelize');
const db = require('./database');

//Define our model
const userSchema = db.define('user', {
  email: {
    type: Sequelize.STRING,
    unique: true,
    allowNull: false
  },
  password: {
    type: Sequelize.STRING,
    allowNull: false
  },

}, {
  instanceMethods: {
    comparePassword : function(candidatePassword, callback) {
      bcrypt.compare(candidatePassword, this.password, function (err, isMatch) {
        if (err) { return callback(err); }

        callback(null, isMatch);
      });
    }
  }
});

//On Save Hook, encrypt password
//Before Saving a model, run this function

userSchema.beforeCreate(function(user, options) {

  return new Promise((resolve, reject) => {
    //generate a salt run callback
    bcrypt.genSalt(10, function (err, salt) {
      if(err) { reject(err); }

      console.log('Calling bcrypt genSalt', salt);
      //hash (encrypt) our password using the salt
      bcrypt.hash(user.dataValues.password, salt, null, function (err, hash) {
        if(err) { reject(err); }

        console.log('within hashing', hash);
        //overwrite plain text password with encrypted password
        user.dataValues.password = hash;
        resolve();
      });
    });
  });
});


//Export the model
module.exports = db.models.user;
