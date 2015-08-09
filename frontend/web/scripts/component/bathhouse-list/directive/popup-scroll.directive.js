'use strict';

var Ps = require('perfect-scrollbar');

PopupScroll.$inject = ['$window'];

function PopupScroll() {

	return {
		restrict: 'A',
		link: function($scope, $element) {

			Ps.initialize($element[0]);

		}
	}
}

module.exports = PopupScroll;