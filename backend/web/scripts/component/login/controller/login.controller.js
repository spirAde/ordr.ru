'use strict';

var _ = require('lodash');

LoginController.$inject = ['$scope', 'auth', 'localStorage'];

function LoginController($scope, auth, localStorage) {

	$scope.credentials = {
		username: '',
		password: ''
	};

	$scope.login = login;

	function login(credentials) {
		console.log('credentials', credentials);
	}
}


module.exports = LoginController;