'use strict';

var _ = require('lodash');

LoginController.$inject = ['$scope', '$state', 'auth', 'localStorage'];

function LoginController($scope, $state, auth, localStorage) {

	$scope.credentials = {
		username: '',
		password: ''
	};

	$scope.login = login;

	function login(credentials) {

		auth.login(credentials)
			.then(function(response) {

				if (response) $state.go('manager');
			});
	}
}


module.exports = LoginController;