'use strict';

Sticky.$inject = ['$window'];

function Sticky($window) {

	return {
		restrict: 'A',
		link: function($scope, $element) {

			var $win = angular.element($window);

			if ($scope._stickyElements === undefined) {

				$scope._stickyElements = [];

				$win.bind('scroll', function(e) {

					var pos = $window.pageYOffset;

					for (var i = 0; i < $scope._stickyElements.length; i++) {

						var item = $scope._stickyElements[i];

						if (!item.isStuck && pos > item.start) {

							item.element.addClass('attached');
							item.isStuck = true;

							$scope.attached = true;
							$scope.$apply();
						}
						else if (item.isStuck && pos < item.start) {

							item.element.removeClass('attached');
							item.isStuck = false;

							$scope.attached = false;
							$scope.$apply();
						}
					}
				});

				var recheckPositions = function() {

					for (var i = 0; i < $scope._stickyElements.length; i++) {

						var item = $scope._stickyElements[i];

						if (!item.isStuck) {

							item.start = item.element[0].getBoundingClientRect().top;
						}
					}
				};

				$win.bind('load', recheckPositions);
				$win.bind('resize', recheckPositions);
			}

			var item = {
				element: $element,
				isStuck: false,
				start: 262
			};

			$scope._stickyElements.push(item);
		}
	}
}

module.exports = Sticky;