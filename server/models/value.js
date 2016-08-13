const Sequelize = require('sequelize');
const db = require('./database');

// imei (variable)=353173066407352 ⇒ SIM ID
// & (separator symbol) timestamp=16/06/07,19:47:20 ⇒ Data point definition ' frequency to be determined.
// &PV=586⇒ DC voltage (V)from PV panel
// &PI=004.6⇒ DC current (I) from PV panel
// &GV=390⇒Grid input Voltage (V, phase-to-phase)
// &GR=10.0⇒ Grid AC Current (I) in 'R' phase
// &GY=10.0⇒Grid AC Current (I) in 'Y' phase
// &GB=10.0⇒Grid AC Current (I) in 'B' phase
// &IV=390⇒ Inverter output Voltage (V, phase-to-phase)
// &IR=06.0⇒Inverter output AC Current (I) in 'R' phase
// &IY=06.0⇒Inverter output AC Current (I) in 'R' phase
// &IB=06.0⇒Inverter output AC Current (I) in 'R' phase

//Define our model
const valueSchema = db.define('value', {
  imei: {
    type: Sequelize.STRING,
    allowNull: false
  },
  timestamp: {
    type: Sequelize.STRING,
    allowNull: false
  },
  PV: {
    type: Sequelize.STRING,
    allowNull: false
  },
  PI: {
    type: Sequelize.STRING,
    allowNull: false
  },
  GV: {
    type: Sequelize.STRING,
    allowNull: false
  },
  GR: {
    type: Sequelize.STRING,
    allowNull: false
  },
  GY: {
    type: Sequelize.STRING,
    allowNull: false
  },
  GB: {
    type: Sequelize.STRING,
    allowNull: false
  },
  IV: {
    type: Sequelize.STRING,
    allowNull: false
  },
  IR: {
    type: Sequelize.STRING,
    allowNull: false
  },
  IY: {
    type: Sequelize.STRING,
    allowNull: false
  },
  IB: {
    type: Sequelize.STRING,
    allowNull: false
  },
});

// //Export the model
module.exports = db.models.value;
