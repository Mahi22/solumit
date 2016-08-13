// Main starting point of the application
const express = require('express');
const http = require('http');
const morgan = require('morgan');
const app = express();
const router = require('./router');
const cors = require('cors');

//App Setup
app.use(morgan('combined'));
app.use(cors());
// app.use(bodyParse.json({ type: '*/*' }));
router(app);

//Server Setup
const port = process.env.PORT || 5000;
const server = http.createServer(app);
server.listen(port);
console.log('Server listening on: ', port);
