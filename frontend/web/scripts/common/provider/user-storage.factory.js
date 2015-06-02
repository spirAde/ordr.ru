'use strict';

userStorage.$inject = ['$window'];

function userStorage($window) {

	var data = {
		userAgent: $window.navigator.userAgent,
		resolution: {
			width: $window.innerWidth,
			height: $window.innerHeight
		},
		cityId: null,
		organizationTypeId: 1
	};

	return {
		data: data
	};
}

module.exports = userStorage;