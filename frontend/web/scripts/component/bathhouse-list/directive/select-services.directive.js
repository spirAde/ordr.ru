'use strict';

var _ = require('lodash');
var Ps = require('perfect-scrollbar');

SelectServices.$inject = ['$compile', '$filter'];

function SelectServices($compile, $filter) {

	return {
		restrict: 'EA',
		replace: true,
		transclude: true,
		scope: {
			list: '=list'
		},
		template: '<div class="select-services"></div>',
		link: function($scope, $element, attrs) {

			var outText = [];

			var $placeholderSpan;

			var boxIsOpen = false;

			//var $totalCostField = $element.closest('.w50-left').next().find('.total-cost');

			var $captionSelectBox = angular.element('<p class="caption-select-box"></p>');
			var $emptyLabel = angular.element('<label><i></i></label>');

			// Если у бани нету услуг, просто пишем об этом и заканчиваем
			var isEmpty = _.every($scope.list, function(services, category) {
				return services.length === 0
			});

			if (isEmpty) {
				$placeholderSpan = angular.element('<span class="placeholder">Дополнительные услуги отсутствуют</span>');
				$captionSelectBox.append($placeholderSpan);

				$element.append($captionSelectBox);
				$compile($captionSelectBox)($scope);

				return false;
			}

			$placeholderSpan = angular.element('<span class="placeholder">Дополнительные услуги и удобства</span>')

			$captionSelectBox.append($placeholderSpan);
			$captionSelectBox.append($emptyLabel);

			var $optionsWrapper = $scope.multiple ?
				angular.element('<div class="options-wrapper multiple"></div>') :
				angular.element('<div class="options-wrapper"></div>');

			var $scroll = angular.element('<div class="scroll"></div>');

			var $optionsContainer = angular.element('<ul class="options"></ul>');

			_.forEach($scope.list, function(services, category) {

				if (services.length) {

					var categoryName = $filter('rusify')(category);

					var $optionElement = angular.element(
						'<li class="disabled"><span><i></i></span><label>' + categoryName + '</label></li>'
					);

					$optionsContainer.append($optionElement);

					_.forEach(services, function(service) {

						var $optionElement = angular.element(
							'<li class=""><span><i></i></span><label><span class="main-text">'+
							service.name + '</span><span class="option-cost">' + service.price + '</span></label></li>');

						$optionsContainer.append($optionElement);

						$optionElement.bind('click', function(e) {

							e.preventDefault();
							var text = e.toElement.innerText;

							this.classList.contains('selected') ?
								outText.splice(outText.indexOf(text), 1) :
								outText.push(text);

							this.classList.toggle('selected');
							setText();

							/*if (optionElement.hasClass('selected')) {
								orderservice.order.services.items.push(service.id);
							}
							else {
								_.pull(orderservice.order.services.items, service.id);
							}

							var summ = orderservice.calculateOrder('services');

							$totalCostField.text(summ + ' руб');*/
						});
					});
				}
			});

			$scroll.append($optionsContainer);
			$optionsWrapper.append($scroll);

			$element.append($captionSelectBox);
			$element.append($optionsWrapper);

			$compile($optionsWrapper)($scope);

			Ps.initialize($scroll[0], {
				suppressScrollX: true
			});

			var openBox = function() {
				boxIsOpen ? $optionsWrapper.removeClass('open') : $optionsWrapper.addClass('open');
				boxIsOpen = !boxIsOpen;
			};

			// Открытие/закрытие выпадающего списка
			$captionSelectBox.bind('click', openBox);

			function setText() {
				if (outText.length) {
					$placeholderSpan.removeClass('placeholder');

					outText.length <= 3 ?
						$placeholderSpan.text(outText.join(', ')) :
						$placeholderSpan.text('Выбранно ' + outText.length + ' услуг');
				}
				else {
					$placeholderSpan.addClass('placeholder');
					$placeholderSpan.text('Дополнительные услуги и удобства');
				}
			}
		}
	}
}

module.exports = SelectServices;