'use strict';

var _ = require('lodash');

var common = require('./common');

module.exports = _.assign(common, {
	HOST: 'ordr.ru',
	PORT: 3000,
	DATABASE: {
		HOST: 'localhost',
		USER: 'root',
		PASSWORD: 'root',
		BASE: 'ordrDB'
	}
});