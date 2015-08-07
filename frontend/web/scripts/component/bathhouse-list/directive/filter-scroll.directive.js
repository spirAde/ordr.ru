'use strict';

var Ps = require('perfect-scrollbar');

FilterScroll.$inject = ['$window'];

function FilterScroll() {

	return {
		restrict: 'A',
		link: function($scope, $element) {

			$scope.$watch('openedBottom', function(newVal, oldVal) {

				if (newVal) {
					Ps.initialize($element[0], {
						suppressScrollX: true
					});
				}
				else if (!newVal && oldVal) {
					Ps.destroy($element[0]);
				}
			});
		}
	}
}

module.exports = FilterScroll;