(function() {

  'use strict';

  angular
    .module('ordrControlApp', [
      'ordrControlApp.managerPage',
      'ordrControlApp.adminPage',

      'authservice',

      'ngDialog',

      'adaptive.detection',
      'ui.router',
      'angular-debug-bar'
    ])
    .config(config)
    .constant('_', window._)
    .constant('USER_ROLES', {
      all: '*',
      admin: 'admin',
      manager: 'manager',
      director: 'director'
    })
    .run(function ($state, $location, $rootScope, $detection, $window, authservice) {
      $rootScope._ = window._; //LoDash

      moment.locale('ru');

      $rootScope.$on('$stateChangeStart', function (event, next) {

        var authorizedRoles = next.data.authorizedRoles;

        // Смог зайти под собой
        if (authservice.isAuthenticated()) {
          // Проходит по правам на данную страницу
          if (authservice.isAuthorized(authorizedRoles)) {

            $location.path($rootScope.nextUrl);
          }
          else {
            // отправляем на стартовую страницу для его роли
            $location.path('/' + authservice.userData.role);
          }
        }
        else {
          $location.path('/login');
        }
      });
    })
    .controller('LoginController', function($scope, $rootScope, $location, $state, authservice) {
      $scope.credentials = {
        username: '',
        password: ''
      };

      $scope.login = function (credentials) {
        authservice.login(credentials).then(function(data) {
          $state.go(authservice.userData.role);
        });
      };
    })

    .directive('formAutofillFix', function ($timeout) {
      return function (scope, element, attrs) {
        element.prop('method', 'post');
        if (attrs.ngSubmit) {
          $timeout(function () {
            element
              .unbind('submit')
              .bind('submit', function (event) {
                event.preventDefault();
                element
                  .find('input, textarea, select')
                  .trigger('input')
                  .trigger('change')
                  .trigger('keydown');
                scope.$apply(attrs.ngSubmit);
              });
          });
        }
      };
    })

    .factory('authInterceptor', function ($rootScope, $q, $window) {
      return {
        request: function (config) {
          config.headers = config.headers || {};
          if ($window.sessionStorage.token) {
            config.headers.Authorization = 'Bearer ' + $window.sessionStorage.token;
          }
          //console.log(config);
          return config;
        },
        response: function (response) {
          if (response.status === 401) {
            console.log('smth wrong');
          }

          return response || $q.when(response);
        }
      };
    });

  config.$inject = ['$stateProvider', '$urlRouterProvider', '$detectionProvider',
    '$locationProvider', '$httpProvider', 'USER_ROLES', 'ngDialogProvider'];

  function config($stateProvider, $urlRouterProvider, $detectionProvider, $locationProvider,
                  $httpProvider, USER_ROLES, ngDialogProvider) {

    ngDialogProvider.setDefaults({
      className: 'ngdialog-theme-default',
      plain: false,
      showClose: false,
      closeByDocument: true,
      closeByEscape: true
      //appendTo: false
    });

    $httpProvider.interceptors.push('authInterceptor');

    $httpProvider.defaults.useXDomain = true;

    //Remove the header used to identify ajax call  that would prevent CORS from working
    //delete $httpProvider.defaults.headers.common['X-Requested-With'];

    $stateProvider
      .state('manager', {
        url: '/manager',
        data: {
          authorizedRoles: [USER_ROLES.manager, USER_ROLES.admin]
        },
        controller: 'managerPage',
        templateUrl: '/partials/manager/page.html',
        resolve: {
          bathhouse: function($http) {
            return $http
              .get('http://api.ordr.ru/control/bathhouses?rooms&services')
              .then(function(response) {
                return response.data;
              });
          }
        }
      })
      /*.state('director', {
        url: '/director',
        data: {
          authorizedRoles: [USER_ROLES.director, USER_ROLES.admin]
        },
        views: {

        }
      })*/
      .state('admin', {
        url: '/admin',
        data: {
          authorizedRoles: [USER_ROLES.admin]
        },
        controller: 'adminPage',
        templateUrl: '/partials/admin/page.html'
      })
      .state('login', {
        url: '/login',
        data: {
          authorizedRoles: [USER_ROLES.all]
        },
        templateUrl: '/partials/login/page.html'
      });

    $urlRouterProvider.otherwise('/login');

    $locationProvider.html5Mode(true);
  }
})();