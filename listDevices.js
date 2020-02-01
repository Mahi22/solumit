var Particle = require('particle-api-js');

var particle = new Particle();

var token = '1efe3ec01ee1c716498e13b4a988dfc51d6f63c9';
var devicesPr = particle.listDevices({ auth: token });

devicesPr.then(
  function(devices){
    console.log('Devices: ', devices);
  },
  function(err) {
    console.log('List devices call failed: ', err);
  }
);