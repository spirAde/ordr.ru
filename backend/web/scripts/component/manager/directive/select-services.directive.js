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

			if (!_.isEmpty($scope.list)) {

				_render();
				_subscribe();
			}

			function _initialize() {

				$captionSelectBox = angular.element('<p class="caption-select-box"></p>');
				$emptyLabel = angular.element('<label><i></i></label>');

				if (_.isEmpty($scope.list)) {

					$placeholderSpan = angular.element('<span class="placeholder">Дополнительные услуги отсутствуют</span>');

					$captionSelectBox.append($placeholderSpan);
				}
				else {

					$placeholderSpan = angular.element('<span class="placeholder">Дополнительные услуги и удобства</span>');

					$captionSelectBox.append($placeholderSpan);
					$captionSelectBox.append($emptyLabel);
				}

				$element.append($captionSelectBox);

				$compile($captionSelectBox)($scope);
			}

			function _render() {

				var $optionsContainer, $optionElement;

				_.forEach($scope.list, function(services, category) {

					$optionElement = angular.element('<li class="disabled"><span><i></i></span><label>' + category + '</label></li>');

					$optionsContainer.append($optionElement);

					_.forEach(services, function(service) {

						$optionElement = angular.element(
							'<li class=""><span><i></i></span><label><span class="main-text">'+
							service.name + '</span><span class="option-cost">' + service.price + '</span></label></li>');

						$optionElement.attr('data-service', service.id);

						$optionsContainer.append($optionElement);
					});
				});

				$captionSelectBox.append($optionsContainer);
			}

			function _setText() {}

			function _subscribe() {}
		}
	}
}

module.exports = SelectServices;