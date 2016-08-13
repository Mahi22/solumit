const Sequelize = require('sequelize');
const db = require('./database');

//Define our model
const deviceSchema = db.define('device', {
  address: {
    type: Sequelize.STRING,
    allowNull: false
  },
  imei: {
    type: Sequelize.STRING(15),
    unique: true,
    allowNull: false,
    primaryKey: true
  },
  latitude: {
    type: Sequelize.DECIMAL(10, 8),
    allowNull: true,
    defaultValue: null,
    validate: { min: -90, max: 90 }
  },
  longitude: {
    type: Sequelize.DECIMAL(10, 7),
    allowNull: true,
    defaultValue: null,
    validate: { min: -180, max: 180 }
  },
  userName: {
    type: Sequelize.STRING,
    allowNull: false
  },
  userEmail: {
    type: Sequelize.STRING,
    allowNull: false,
    validate: {
      isEmail: true
    }
  }
}, {
  validate: {
    bothCoordsOrNone: function() {
      if ((this.latitude === null) !== (this.longitude === null)) {
        throw new Error('Require either both latitude and longitude or neither')
      }
    }
  }
});

// deviceSchema.hasOne(User);
// User.hasMany(deviceSchema);

// User.hasMany(deviceSchema);
// deviceSchema.belongsTo(User);

//Synchronise the table
// db.sync({force: true})
// .then(() => {
//   console.log('created device table');
// })
// .catch(function(error){
//   // console.log(error);
// });

// //Export the model
module.exports = db.models.device;
