(function() {
  'use strict';

  angular
    .module('logservice', [])
    .factory('logservice', logservice);

  logservice.$inject = ['$http'];

  function logservice($http) {

    var service = {
      getLogs: getLogs,
      createLogs: createLogs
    };

    return service;

    function getLogs() {

    }

    function createLogs() {

    }
  }
}());