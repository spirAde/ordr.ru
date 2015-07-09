'use strict';

auth.$inject = ['$http'];

function auth() {

	return {
		login: login
	};


	function login() {

	}
}

module.exports = auth;