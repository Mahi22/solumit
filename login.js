var Particle = require('particle-api-js');

var particle = new Particle();

particle.login({username: process.env.USERNAME, password: process.env.PASSWORD }).then(
    function(data) {
      token = data.body.access_token;
      console.log('TOKEN', token);
    },
    function (err) {
      console.log('Could not log in.', err);
    }
);