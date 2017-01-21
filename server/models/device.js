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
  username: {
    type: Sequelize.STRING,
    allowNull: false
  },
  solarUnits: {
    type: Sequelize.FLOAT
  },
  gridUnits: {
    type: Sequelize.FLOAT
  },
  totalUnits: {
    type: Sequelize.FLOAT
  },
  solarPotentialLost: {
    type: Sequelize.FLOAT
  },
  users: {
    type: Sequelize.INTEGER,
    defaultValue: 0
  },
  calculateFromDate: {
    type: Sequelize.STRING
  },
  startDate: {
    type: Sequelize.STRING
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
