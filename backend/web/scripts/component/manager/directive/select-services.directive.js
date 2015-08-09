'use strict';

var _ = require('lodash');
var Ps = require('perfect-scrollbar');

SelectServices.$inject = ['$compile', '$filter'];

function SelectServices($compile, $filter) {

	return {
		restrict: 'EA',
		replace: true,
		transclude: true,
		template: '<div class="select-services"></div>',
		scope: {
			selectedServices: '&selectedServices'
		},
		link: function($scope, $element) {

			var list = $scope.$parent.$parent.bathhouse.services;

			var $captionSelectBox, $emptyLabel, $placeholderSpan, $optionsWrapper, $optionsContainer, $scroll;
			var boxIsOpen = false;
			var text = [];
			var selected = [];

			_initialize();

			if (!_.isEmpty(list)) {

				_render();
				_subscribe();
			}

			function _initialize() {

				$captionSelectBox = angular.element('<p class="caption-select-box"></p>');
				$emptyLabel = angular.element('<label><i></i></label>');
				$optionsContainer = angular.element('<ul class="options"></ul>');
				$optionsWrapper = angular.element('<div class="options-wrapper multiple"></div>');
				$scroll = angular.element('<div class="scroll"></div>');

				if (_.isEmpty(list)) {

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

				var $optionElement;

				_.forEach(list, function(services, category) {

					var name = $filter('rusify')(category);

					$optionElement = angular.element('<li class="disabled"><span><i></i></span><label>' + name + '</label></li>');

					$optionsContainer.append($optionElement);

					_.forEach(services, function(service) {

						$optionElement = angular.element(
							'<li class=""><span><i></i></span><label><span class="main-text">'+
							service.name + '</span><span class="option-cost">' + service.price + '</span></label></li>');

						$optionElement.attr('data-service', service.id);

						$optionsContainer.append($optionElement);
					});
				});

				$scroll.append($optionsContainer);
				$optionsWrapper.append($scroll);
				$element.append($optionsWrapper);

				$compile($optionsWrapper)($scope);
			}

			function _setText() {

				if (selected.length) {
					$placeholderSpan.removeClass('placeholder');

					selected.length <= 3 ?
						$placeholderSpan.text(text.join(', ')) :
						$placeholderSpan.text('Выбранно ' + text.length + ' услуг');
				}
				else {
					$placeholderSpan.addClass('placeholder');
					$placeholderSpan.text('Дополнительные услуги и удобства');
				}
			}

			function _subscribe() {

				Ps.initialize($scroll[0], {
					suppressScrollX: true
				});

				$captionSelectBox.bind('click', function(event) {

					event.preventDefault();

					boxIsOpen ? $optionsWrapper.removeClass('open') : $optionsWrapper.addClass('open');
					boxIsOpen = !boxIsOpen;
				});

				$optionsContainer[0].addEventListener('click', function(event) {

					event.preventDefault();

					var target = event.target;
					var classList = target.classList;

					if (_.indexOf(classList, 'disabled') === -1) {

						while(target && target.tagName !== 'LI') {
							target = target.parentNode;
						}

						var service = _.find(_.flatten(_.values(list)), {id: target.dataset.service});

						if (_.indexOf(selected, service.id) === -1) {

							selected.push(service.id);
							text.push(service.name);
							target.className += ' selected';
						}
						else {

							_.pull(selected, service.id);
							_.pull(text, service.name);
							target.classList.remove('selected');
						}

						$scope.selectedServices({services: selected});
						_setText();
					}
				}, false);
			}
		}
	}
}

module.exports = SelectServices;