const _build = require('./models/build');
const Authentication = require('./controllers/authentication');
const Data = require('./controllers/data');
const Device = require('./controllers/device');
const Excel = require('./controllers/excel');

const bodyParse = require('body-parser');
const passport = require('passport');
const passportService = require('./services/passport');

const requireAuth = passport.authenticate('jwt', { session: false });
const requireSignin = passport.authenticate('local', { session: false });

const jsonParser = bodyParse.json({ type: '*/*' });
const urlencodedParser = bodyParse.urlencoded({ extended: false });

const schedule = require('node-schedule');

const rule = new schedule.RecurrenceRule();
rule.hour = 0;  // Hour at which to run
rule.minute = 0; // Minute at which to run

const j = schedule.scheduleJob(rule, function(){
  console.log('The answer to life, the universe, and everything!');
});


module.exports = function (app) {

  app.get('/', requireAuth, function (req, res) {
    res.send({ message: 'Super secret code is ABC123' });
  });

  app.post('/signin', jsonParser, requireSignin, Authentication.signin);

  app.post('/checkemail', jsonParser, Authentication.checkemail);

  app.post('/signup', jsonParser, Authentication.signup);

  app.post('/collect', urlencodedParser, Data.collect);

  app.post('/test', urlencodedParser, Data.newCollect);

  app.post('/createdevice', urlencodedParser, Device.createdevice);

  app.post('/newdevicetoken', urlencodedParser, Device.newTokenGenerate);

  app.post('/createuser', jsonParser, Device.createuser);

  app.get('/day', urlencodedParser, Data.dayData);

  app.get('/excel', urlencodedParser, Excel.excelData);

  app.get('/all', urlencodedParser, Data.allData);

  app.get('/overallcreate', urlencodedParser, Data.overallData);

  app.get('/overalldata', urlencodedParser, Device.overallData);
}
