(function() {
  'use strict';

  angular
    .module('authservice', ['B64'])
    .factory('authservice', authservice);

  authservice.$inject = ['$http', '$window', 'base64'];

  function authservice($http, $window, base64) {
    var authService = {
      userData: {}
    };

    authService.url_base64_decode = function(str) {
      var output = str.replace('-', '+').replace('_', '/');
      switch (output.length % 4) {
        case 0:
          break;
        case 2:
          output += '==';
          break;
        case 3:
          output += '=';
          break;
        default:
          throw 'Illegal base64url string!';
      }
      return base64.decode(output);
    };

    authService.login = function (credentials) {

      return $http
        .post('http://api.ordr.ru/control/logins', credentials)
        .success(function(data) {
            $window.sessionStorage.token = data.token;
            authService.readToken();
        });
    };

    authService.readToken = function() {
      var encodedData = $window.sessionStorage.token.split('.')[1];
      authService.userData = JSON.parse(authService.url_base64_decode(encodedData));
    };

    authService.isAuthenticated = function() {
      if (!angular.isUndefined($window.sessionStorage.token)) {
        authService.readToken();
        return true;
      }

      return false;
    };

    authService.isAuthorized = function(authorizedRoles) {
      if (!angular.isArray(authorizedRoles)) {
        authorizedRoles = [authorizedRoles];
      }
      return (authorizedRoles.indexOf(authService.userData.role) !== -1);
    };

    return authService;
  }
}());