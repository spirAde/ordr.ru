'use strict';

var Ps = require('perfect-scrollbar');

SchedulePanelScroll.$inject = ['$window'];

function SchedulePanelScroll() {

	return {
		restrict: 'EA',
		//replace: true,
		require: '^schedulePanel',
		link: function($scope, $element) {

			Ps.initialize($element[0], {
				wheelPropagation: true,
				suppressScrollX: true
			});
		}
	}
}

module.exports = SchedulePanelScroll;