'use strict';

user.$inject = ['$window'];

function user($window) {

	var data = {
		userAgent: $window.navigator.userAgent,
		resolution: {
			width: $window.innerWidth,
			height: $window.innerHeight
		}
	};

	return {
		data: data
	};
}

module.exports = user;