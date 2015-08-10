'use strict';

var moment = require('moment');

FormatTime.$inject = ['CONSTANTS'];

function FormatTime(CONSTANTS) {

	return function(input) {
		return CONSTANTS.periods[input];
	}
}

module.exports = FormatTime;