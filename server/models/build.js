const db = require('./database');
const Device = require('./device');
const User = require('./user');
const Value = require('./value');

// const data = require('./data.json');



//Relationships
// User.hasMany(Device);
Device.belongsTo(User);
// Device.hasOne(User);
Device.hasMany(Value);
// Value.belongsTo(Device);

function formatDate(stringValue) {
  // new Date(year, month, day, hours, minutes, seconds, milliseconds)
  const dateParts = stringValue.match(/(\d+)\/(\d+)\/(\d+),(\d+):(\d+):(\d+)/);

  return new Date(`20${dateParts[1]}`, dateParts[2]-1, dateParts[3], dateParts[4], dateParts[5], dateParts[6]);
}

//Synchronise the table
db.sync().then(() => {
  // data.forEach((row, index) => {
  //   const {
  //     imei,timestamp,data
  //   } = row;
  //
  //   if(imei && timestamp && data) {
  //     const arr = data.match(/.{1,3}/g);
  //     const GV = arr[0],
  //           GC = arr[1],
  //           PV = arr[2],
  //           PC = arr[3],
  //           IV = arr[4],
  //           IR = arr[5],
  //           IY = arr[6],
  //           IB = arr[7];
  //
  //     Value.create({
  //       imei,timestamp, GV, GC, PV, PC, IV, IR, IY, IB, data
  //     }).then(value => {
  //       // res.send('successfully posted');
  //     })
  //     .catch((err) => {
  //       // res.send('Could not post in database');
  //     });
  //   }
  // });
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
