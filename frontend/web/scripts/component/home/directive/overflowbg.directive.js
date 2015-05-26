'use strict';

OverflowBackground.$inject = ['$window'];

function OverflowBackground($window) {

	return {
		restrict: 'A',
		link: function($scope, $element) {

			$element.css('height', $window.innerHeight + 'px');
		}
	}
}

module.exports = OverflowBackground;