const db = require('./database');
const Device = require('./device');
const User = require('./user');
const Value = require('./value');
//Relationships
User.hasMany(Device);
Device.belongsTo(User);
// Device.hasOne(User);
Device.hasMany(Value);
Value.belongsTo(Device);

function formatDate(stringValue) {
  // new Date(year, month, day, hours, minutes, seconds, milliseconds)
  const dateParts = stringValue.match(/(\d+)\/(\d+)\/(\d+),(\d+):(\d+):(\d+)/);

  return new Date(`20${dateParts[1]}`, dateParts[2]-1, dateParts[3], dateParts[4], dateParts[5], dateParts[6]);
}


//Synchronise the table
db.sync({ force: true }).then(() => {
  User.create({
    email: 'xyz@example.com',
    password: '123'
  })
  .then(user => {
    user.createDevice({
      address: '123, test address',
      imei: '123456789012345',
      latitude: 12.34,
      longitude: 12.45,
      location: 'office',
      userName: 'Prashant',
      userEmail: 'xyz@test.com'
    })

  });


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
