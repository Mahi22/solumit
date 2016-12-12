const db = require('./database');
const Device = require('./device');
const User = require('./user');
const Value = require('./value');
//Relationships
User.hasMany(Device, { foreignKey: 'userId' });
// Device.belongsTo(User);
// Device.hasOne(User);
Device.hasMany(Value);
// Value.belongsTo(Device);

function formatDate(stringValue) {
  // new Date(year, month, day, hours, minutes, seconds, milliseconds)
  const dateParts = stringValue.match(/(\d+)\/(\d+)\/(\d+),(\d+):(\d+):(\d+)/);

  return new Date(`20${dateParts[1]}`, dateParts[2]-1, dateParts[3], dateParts[4], dateParts[5], dateParts[6]);
}


//Synchronise the table
db.sync({ force: true }).then(() => {
  console.log('Database Initiated');
});

//
// Device.create({
  // address: '123, test address',
  // imei: '123456789012345',
  // latitude: 12.34,
  // longitude: 12.45,
  // location: 'office',
  // userName: 'Prashant',
  // userEmail: 'xyz@test.com'
// });

// Value.create({
//   imei: '353173066407352',
//   timestamp: '16/09/11,03:11:16',
//   GV: '819',
//   GC: '819',
//   PV: '819',
//   PC: '819',
//   IV: '819',
//   IR: '819',
//   IY: '819',
//   IB: '819',
//   data: '819819819819819819819819'
// })
