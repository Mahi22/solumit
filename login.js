var Particle = require('particle-api-js');

var particle = new Particle();

particle.login({username: 'suneet@solumenterprises.com', password: '1@Goodwill'}).then(
    function(data) {
      token = data.body.access_token;
      console.log('TOKEN', token);
    },
    function (err) {
      console.log('Could not log in.', err);
    }
);