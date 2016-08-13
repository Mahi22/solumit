const Sequelize = require('sequelize');

//DB setup
const Conn = new Sequelize(
	'solum',
	'postgres',
	'postgres',
	{
		dialect : 'postgres',
		host: 'localhost',
		pool: {
    	max: 5,
    	min: 0,
    	idle: 10000
  	}
	}
);

Conn
	.authenticate()
	.then(function (err) {
		console.log('Database Connection has been established successfully.');
	})
	.catch(function (err) {
		console.log('Unable to connect to the database', err);
	});

module.exports = Conn;
