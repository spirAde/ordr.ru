(function() {
  'use strict';

  angular
    .module('dataservice', [])
    .factory('dataservice', dataservice);

  dataservice.$inject = ['$http'];

  function dataservice($http) {

    var service = {
      getPrices: getPrices
    };

    return service;

    function getPrices(rooms, callback) {
      var self = this;

      _(rooms).forEach(function(room) {
        $http
          .get('http://api.ordr.ru/control/rooms/' + room['room_id'] + '?prices')
          .then(function(response) {
            callback(response.data);
          });
      });
    }
  }
}());