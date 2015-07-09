'use strict';

httpInterceptor.$inject = ['localStorage'];

function httpInterceptor(localStorage) {

	return {
		request: setHeaders
	};


	function setHeaders(config) {

		config.headers = config.headers || {};

		var apiVersion = '1.0';

		// JWT Token
		var token = localStorage.getToken();

		if (token) {
			config.headers.Authorization = 'Bearer ' + token;
		}

		config.headers.Accept = 'application/json; version=' + apiVersion;

		return config;
	}
}

module.exports = httpInterceptor;