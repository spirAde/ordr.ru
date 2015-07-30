'use strict';

var _ = require('lodash');
var moment = require('moment');

Schedule.$inject = ['$rootScope', '$compile'];

function Schedule($rootScope, $compile) {

	var now = moment().format('YYYY-MM-DD'),
		itemsLength = undefined,

	// Так как прокрутка в owl-carousel работает некорректно для merge ячеек, мы будем слайдить в обход ее,
	// поэтому фиксируем:
		currentSlide = undefined,       // текущую позицию карусели, индекс крайней левой видимой ячейки
		currentOrdersShift = undefined, // общее смещение относительно начала карусели с заказами
		currentTimeShift = undefined;   // общее смещение относительно начала карусели с временем

	return {
		restrict: 'EA',
		replace: true,
		transclude: true,
		template: '<div class="schedule-panel"></div>',
		scope: {
			orders: '=orders',
			roomId: '=roomId',
			minDuration: '=minDuration',
			changePosition: '=changePosition',

			showOrder: '&showOrder',
			getOrders: '&getOrders',
			newOrder: '&newOrder'
		},
		link: function($scope, $element) {

			$scope.$watch('orders', function(newVal, oldVal) {

				if (!_.isUndefined(newVal)) {

					// Достраиваем только даты, которых еще нету в карусели
					var newDates = _.difference(_.keys(newVal), _.keys(oldVal));
					console.log(newDates);
					//if (newDates.length) addDays(newDates);
				}
			}, true);
		}
	}
}

module.exports = Schedule;