'use strict';

var _ = require('lodash');

SelectSingle.$inject = ['$compile'];

function SelectSingle($compile) {

	return {
		restrict: 'EA',
		replace: true,
		transclude: true,
		scope: {
			list: '=list',

			onChange: '&'
		},
		template: '<div class="select"></div>',
		link: function($scope, $element) {

			var outText = [];

			var boxIsOpen = false;

			var $captionSelectBox = angular.element('<p class="caption-select-box"></p>');
			var $placeholderSpan = angular.element('<span class="placeholder">' + $scope.placeholder + '</span>');
			var $emptyLabel = angular.element('<label><i></i></label>');

			$captionSelectBox.append($placeholderSpan);
			$captionSelectBox.append($emptyLabel);

			var $optionsWrapper = angular.element('<div class="options-wrapper"></div>');

			var $optionsContainer = angular.element('<ul class="options"></ul>');

			var firstKey = _.keys($scope.list)[0];

			angular.forEach($scope.list, function(option, id) {

				if (id === firstKey) {
					var $optionElement = angular.element('<li class="selected"><label>' + option + '</label></li>');
					outText.push(option);
					setText();
				}
				else {
					var $optionElement = angular.element('<li class=""><label>' + option + '</label></li>');
				}

				$optionElement.bind('click', function(e) {

					e.preventDefault();

					$optionsContainer.children().removeClass('selected');

					$optionElement.addClass('selected');

					var text = $optionElement.find('label').text();
					outText[0] = text;

					setText();
					openBox();

					$scope.onChange({id: id});
				});

				$optionsContainer.append($optionElement);
			});

			$optionsWrapper.append($optionsContainer);

			$element.append($captionSelectBox);
			$element.append($optionsWrapper);

			$compile($optionsWrapper)($scope);

			var openBox = function() {
				boxIsOpen ? $optionsWrapper.removeClass('open') : $optionsWrapper.addClass('open');
				boxIsOpen = !boxIsOpen;
			};

			// Открытие/закрытие выпадающего списка
			$captionSelectBox.bind('click', openBox);

			function setText() {
				if (outText.length) {
					$placeholderSpan.removeClass('placeholder');

					$placeholderSpan.text(outText[0]);
				}
				else {
					$placeholderSpan.addClass('placeholder');
					$placeholderSpan.text($scope.placeholder);
				}
			}
		}
	}
}

module.exports = SelectSingle;