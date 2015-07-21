'use strict';

var _ = require('lodash');
var moment = require('moment');

Schedule.$inject = ['$rootScope', '$compile'];

function Schedule($rootScope, $compile) {

	return {
		restrict: 'EA',
		replace: true,
		transclude: true,
		template: '<div class="date clear"></div>',
		link: function($scope, $element) {


		}
	}
}

module.exports = Schedule;