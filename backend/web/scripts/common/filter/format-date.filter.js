'use strict';

var moment = require('moment');

function FormatDate() {

	return function(input) {
		return moment(input).format('dddd, MMMM Do YYYY');
	}
}

module.exports = FormatDate;