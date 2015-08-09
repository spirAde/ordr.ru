'use strict';

SelectServices.$inject = ['$compile'];

function SelectServices($compile) {

	return {
		restrict: 'EA',
		replace: true,
		transclude: true,
		template: '<div class="select-services"></div>',
		scope: {
			list: '=list',

			selectServices: '&selectServices'
		},
		link: function($scope, $element) {

			var $captionSelectBox, $emptyLabel, $placeholderSpan;

			_initialize();

			function _initialize() {

				$captionSelectBox = angular.element('<p class="caption-select-box"></p>');
				$emptyLabel = angular.element('<label><i></i></label>');

				$element.append($captionSelectBox);

				$compile($captionSelectBox)($scope);
			}

			function _render() {

				var $optionsContainer, $optionElement;

				if (_.isEmpty($scope.list)) {

					$placeholderSpan = angular.element('<span class="placeholder">Дополнительные услуги отсутствуют</span>');
				}
				else {

					_.forEach($scope.list, function(services, category) {


					});
				}
			}

			function _setText() {}

			function _subscribe() {}
		}
	}
}

module.exports = SelectServices;