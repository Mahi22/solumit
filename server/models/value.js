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
  timestamp: {
    type: Sequelize.DATE,
    allowNull: false
  }
});

// //Export the model
module.exports = db.models.value;
