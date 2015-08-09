'use strict';

Sticky.$inject = ['$window', '$timeout'];

function Sticky($window, $timeout) {

	return {
		restrict: 'A',
		link: function($scope, $element) {

			var offset;

			$timeout(function() {
				offset = $element[0].offsetTop;
			}, 0);

			angular.element($window).bind('scroll', function() {

				if (offset > $window.pageYOffset) {

					$element.removeClass('attached');

					$scope.attached = false;
					$scope.$apply();
				}
				else {
					$element.addClass('attached');

					$scope.attached = true;
					$scope.$apply();
				}
			});
		}
	}
}

module.exports = Sticky;