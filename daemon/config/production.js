'use strict';

var _ = require('lodash');

var common = require('./common');

module.exports = _.assign(common, {
	HOST: 'ordr.ru',
	PORT: 3000,
	DATABASE: {
		HOST: '46.101.220.137',
		USER: 'root',
		PASSWORD: 'dpeJHM~7l',
		BASE: 'ordrDB'
	}
});