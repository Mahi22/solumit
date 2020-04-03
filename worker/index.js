require('dotenv').config();
const deviceData = require('./data');

const auth = '1efe3ec01ee1c716498e13b4a988dfc51d6f63c9';

deviceData('3c0047000651353530333533', auth, 'device1');

deviceData('1f0053000451353432383931', auth, 'device3');

deviceData('31002d000651353530333533', auth, 'device2');

