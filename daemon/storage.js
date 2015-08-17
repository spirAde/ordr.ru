var env = process.env.NODE_ENV || 'development';
var config = require('./config/' + env);

var _ = require('lodash');

var mysql = require('mysql');

module.exports = {
	getCities: getCities,
	getBathhouses: getBathhouses
};

function getCities(callback) {

	var connection = mysql.createConnection({
		host: config.DATABASE.HOST,
		user: config.DATABASE.USER,
		password: config.DATABASE.PASSWORD,
		database: config.DATABASE.BASE
	});

	var query = [
		'SELECT',
			'city.id, city.slug',
		'FROM',
			'city'].join(' ');

	connection.connect();

	connection.query(query, function(error, rows) {

		if (error) callback(error);

		callback(null, rows);
	});

	connection.end();
}

function getBathhouses(callback) {

	var connection = mysql.createConnection({
		host: config.DATABASE.HOST,
		user: config.DATABASE.USER,
		password: config.DATABASE.PASSWORD,
		database: config.DATABASE.BASE
	});

	var query = [
		'SELECT',
			'bathhouse.id, city.slug',
		'FROM',
			'bathhouse',
			'INNER JOIN city ON city.id = bathhouse.city_id'].join(' ');

	connection.connect();

	connection.query(query, function(error, rows) {

		if (error) callback(error);

		callback(null, rows);
	});

	connection.end();
}