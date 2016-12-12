const _build = require('./models/build');
const Authentication = require('./controllers/authentication');
const Data = require('./controllers/data');
const Excel = require('./controllers/excel');

const bodyParse = require('body-parser');
const passport = require('passport');
const passportService = require('./services/passport');

const requireAuth = passport.authenticate('jwt', { session: false });
const requireSignin = passport.authenticate('local', { session: false });

const jsonParser = bodyParse.json({ type: '*/*' });
const urlencodedParser = bodyParse.urlencoded({ extended: false });

module.exports = function (app) {

  app.get('/', requireAuth, function (req, res) {
    res.send({ message: 'Super secret code is ABC123' });
  });

  app.post('/signin', jsonParser, requireSignin, Authentication.signin);

  app.post('/signup', jsonParser, Authentication.signup);

  app.post('/collect', urlencodedParser, Data.collect);

  app.post('/test', urlencodedParser, Data.newCollect);

  app.get('/day', urlencodedParser, Data.dayData);

  app.get('/excel', urlencodedParser, Excel.excelData);

  app.get('/all', urlencodedParser, Data.allData);
}
