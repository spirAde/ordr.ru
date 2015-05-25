'use strict';

httpInterceptor.$inject = [];

function httpInterceptor() {

	return {
		request: setHeaders
	};


	function setHeaders(config) {

		config.headers = config.headers || {};

		var apiVersion = '1.0';

		config.headers.Accept = 'application/json; version=' + apiVersion;

		return config;
	}
}

module.exports = httpInterceptor;