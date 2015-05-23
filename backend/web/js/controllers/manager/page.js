(function() {
	'use strict';

	angular
		.module('ordrControlApp.managerPage', [

			'time-calendar-carousel-directive',
			'datepaginator-directive',
      'select-services-directive',
      'perfect-scrollbar-directive',

      'orderservice',
      'dataservice',
      'socketservice',
      'logservice',

			'period-to-time-filter',
			'time-to-period-filter'
		])
		.controller('managerPage', managerPage);

	managerPage.$inject = ['$scope', '$rootScope', '$filter', '$timeout', 'ngDialog',
    'authservice', 'orderservice', 'dataservice', 'socketservice', 'bathhouse'];

	function managerPage($scope, $rootScope, $filter, $timeout, ngDialog,
                       authservice, orderservice, dataservice, socketservice, bathhouse) {

    socketservice.emit('manager:init', authservice.userData);

		$scope.bathhouse = bathhouse;

		$scope.currOrder = {};
    $scope.newOrder = {};

    $scope.records = [];

		$scope.managerName = {
			firstName: authservice.userData.first_name,
			lastName: authservice.userData.last_name
		};

    $scope.slideData = undefined;

    $scope.newRecords = false;
    $scope.newMessages = false;

    $scope.activateRecords = false;
    $scope.activateMessages = false;

    $scope.showRecord = showRecord;
    $scope.openRecords = openRecords;
    $scope.openMessages = openMessages;

    function showRecord(index) {
      var data = $scope.records[index];

      $scope.slideData = {
        roomId: data.order.room_id,
        startDate: data.order.date_from,
        startPeriodId: data.order.time_from
      };
    }

    function openRecords() {
      if ($scope.activateMessages) $scope.activateMessages = false;
      $scope.activateRecords = !$scope.activateRecords;
      $scope.newRecords = false;
    }
    function openMessages() {
      if ($scope.activateRecords) $scope.activateRecords = false;
      $scope.activateMessages = !$scope.activateMessages;
      $scope.newMessages = false;
    }

    _($scope.bathhouse.rooms).forEach(function(room) {
      orderservice.getOrders(room.room_id, '', '').then(
        function(response) {
            room.orders = response.data;
        },
        function(error) {

        }
      );
    });

    socketservice.emit('manager:getReserveOrders', function(reserveOrders) {
      console.log(reserveOrders);
    });

    dataservice.getPrices(bathhouse.rooms, function(data) {
      var room = _.find($scope.bathhouse.rooms, function(room) { return room.room_id == data.room_id; });
      room.prices = data.prices;
    });

		$scope.showOrder = showOrder;
		$scope.newOrder = newOrder;
		$scope.getOrders = getOrders;

		// RoomId можно не тащить, но это улучшает скорость поиска заказа
		function showOrder(roomId, orderId, callback) {

			var room = _.find($scope.bathhouse.rooms, function(room) { return room.room_id === roomId; });

      // Заявка может быть двухдневной, поэтому ищем все заказы с данным id
			var orders = _.where(_.flatten(_.toArray(room.orders)), function(order) { return order.id === orderId; });

      if (orders.length === 1) {
        $scope.currOrder = orders[0];
      }
      else {
        $scope.currOrder = orders[0];
        $scope.currOrder.time_to = orders[1].time_to;
      }

      $scope.isLocked = true; // Блок на кнопку удаления на случай судороги у манагера)

			ngDialog.open({
				template: $scope.currOrder.through_site ? templates.showSiteOrder : templates.showManagerOrder,
				scope: $scope,
				controller: ['$scope', function($scope) {
					$scope.cancelOrder = function() {
						ngDialog.close();
						callback(400);
					};

					$scope.deleteOrder = function() {

            if ($scope.isLocked) {
              $scope.isLocked = false;
              return;
            }

						orderservice.deleteOrder(orderId).then(
							function(response) {
								callback(response.status);

                var order = _.find(_.flatten($scope.bathhouse.rooms, 'orders'), function(order) { return order.id === orderId; });
								_.remove(_.flatten($scope.bathhouse.rooms, 'orders'), function(order) { return order.id === orderId; });

								ngDialog.close();

                $scope.records.unshift({
                  status: 'delete',
                  created: moment().format('MM-DD HH:mm:ss'),
                  order: order
                });
							},
							function(error) {
								callback(error.status);
								ngDialog.close();
							}
						);
					};

					$scope.updateOrder = function() {
						//
					};
				}]
			});
		}

		function newOrder(orderData, callback) {

			ngDialog.open({
				template: templates.createOrder,
				scope: $scope,
				controller: ['$scope', function ($scope) {

					var room = _.find($scope.bathhouse.rooms, function(room) { return room.room_id == orderData.roomId });

          $scope.newOrder = orderData;

          $scope.newOrder.services = [];
          $scope.newOrder.guests = 0;
          $scope.newOrder.comment = '';

          $scope.newOrder.summTime = orderservice.calculateTime(room.prices, orderData);
          $scope.newOrder.summServices = 0;
          $scope.newOrder.summGuests = 0;

          $scope.$watchGroup(['newOrder.summServices', 'newOrder.summGuests'], function() {
            $scope.newOrder.summ = $scope.newOrder.summTime + $scope.newOrder.summServices + $scope.newOrder.summGuests;
          });

          $scope.calculateServices = function(services) {
            $scope.$apply(function() {
              $scope.newOrder.services = services;
              $scope.newOrder.summServices = orderservice.calculateServices($scope.bathhouse.services, services);
            });
          };

					$scope.saveOrder = function() {
						orderservice.createOrder($scope.newOrder).then(
							function(response) {
								callback(response);

                $scope.records.unshift({
                  status: 'create',
                  created: moment().format('MM-DD HH:mm:ss'),
                  order: response.data
                });

								room.orders[orderData.startDate].push(response.data);

                socketservice.emit('manager:actionOrder', {
                  bathhouseId: response.data.bathhouse_id,
                  roomId: response.data.room_id,
                  startDate: response.data.date_from,
                  endDate: response.data.date_to,
                  startPeriodId: response.data.time_from,
                  endPeriodId: response.data.time_to,
                  status: 'created'
                });

								$scope.newOrder = {};
								ngDialog.close();
							},
							function(error) {
								callback(error);
								ngDialog.close();
							}
						);
					};

					$scope.cancelOrder = function() {
            var response = {status: 500};
            callback(response);
						ngDialog.close();
					};
				}]
			});
		}

    function getOrders(roomId, startDate, endDate) {
      orderservice.getOrders(roomId, startDate, endDate).then(
        function(response) {
          var room = _.find($scope.bathhouse.rooms, function(room) { return room.room_id == roomId; });
          angular.extend(room.orders, response.data);
        },
        function(error) {

        }
      )
    }

    $scope.$watch('records.length', function(newVal) {
      if (newVal >= 1) {
        if (!$scope.activateRecords) $scope.newRecords = true;
      }
    });

    socketservice.on('daemon:reserveOrder', function(orderData) {
      console.log(orderData);
    });

    var templates = {
      createOrder: '/partials/templates/createOrder.html',
      showManagerOrder: '/partials/templates/showManagerOrder.html',
      showSiteOrder: '/partials/templates/showSiteOrder.html'
    };
	}
}());