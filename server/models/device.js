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
  email: {
    type: Sequelize.STRING,
    allowNull: false,
    validate: {
      isEmail: true
    }
  },
  lastTimestamp: {
    type: Sequelize.STRING,
  },
  collectiveSolarUnits: {
    type: Sequelize.FLOAT
  },
  collectiveGridUnits: {
    type: Sequelize.FLOAT
  },
  collectiveTotalUnits: {
    type: Sequelize.FLOAT
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

// //Export the model
module.exports = db.models.device;
