(function() {
  'use strict';

  angular
    .module('orderservice', [])
    .factory('orderservice', orderservice);

  orderservice.$inject = ['$http'];

  function orderservice($http) {

    var service = {
      orders: {},
      order: {
        roomId: undefined,
        startDate: undefined,
        endDate: undefined,
        startPeriodId: undefined,
        endPeriodId: undefined
      },

      getOrders: getOrders,
      createOrder: createOrder,
      deleteOrder: deleteOrder,
      calculateTime: calculateTime,
      calculateServices: calculateServices
    };

    return service;

    /*function logOrder() {
      $http
        .get('http://control.ordr.ru/index.php?r=log/smth');
    }*/

    function getOrders(roomId, startDate, endDate) {

      return $http
        .get('http://api.ordr.ru/control/orders?room_id=' + roomId + '&start_date=' + startDate + '&end_date=' + endDate);
    }

    function createOrder(orderData) {
      return $http.post('http://api.ordr.ru/control/orders', orderData);
    }

    function deleteOrder(orderId) {
      return $http.delete('http://api.ordr.ru/control/orders/' + orderId);
    }

    function calculateTime(prices, orderData) {

      var summ = 0;
      var redeterminedOrder = {};

      // В зависимости на одну или на две даты приходится заказ, переопределим orderData
      if (moment(orderData.startDate).isSame(orderData.endDate)) {
        redeterminedOrder[orderData.startDate] = [orderData.startPeriodId, orderData.endPeriodId];
      }
      else {
        redeterminedOrder[orderData.startDate] = [orderData.startPeriodId, 144];
        redeterminedOrder[orderData.endDate] = [0, orderData.endPeriodId];
      }

      _(redeterminedOrder).forEach(function(dateOrders, date) {

        var selectedIndexes = [],
          startDayIndex = moment(date).day(),
          dayPrices = prices[startDayIndex],
          minIndex,
          maxIndex;

        // находим в каких ценновых периодах лежит заказ в рамках текущего дня
        _(dayPrices).forEach(function(pricePeriod, idx) {
          if ((pricePeriod.period[0] <= dateOrders[0] && dateOrders[0] < pricePeriod.period[1]) ||
            (pricePeriod.period[0] <= dateOrders[1] && dateOrders[1] < pricePeriod.period[1])) {

            selectedIndexes.push(idx);
          }
        });

        minIndex = _.min(selectedIndexes);
        maxIndex = _.max(selectedIndexes);

        // На случай, если заказ перекрывает больше 2х ценновых периодов
        selectedIndexes = _.range(minIndex, maxIndex).concat(maxIndex);

        // Если заказ лежит в 1ом ценновом периоде
        if (selectedIndexes.length === 1) {
          summ += prices[startDayIndex][selectedIndexes[0]]['price'] * (dateOrders[1] - dateOrders[0]);
        }
        else {
          _(selectedIndexes).forEach(function(index) {
            if (index === minIndex) {
              summ += prices[startDayIndex][index]['price'] * (prices[startDayIndex][index]['period'][1] - dateOrders[0]);
            }
            else if (index === maxIndex) {
              summ += prices[startDayIndex][index]['price'] * (dateOrders[1] - prices[startDayIndex][index]['period'][0]);
            }
            else {
              summ += prices[startDayIndex][index]['price'] * (prices[startDayIndex][index]['period'][1] - prices[startDayIndex][index]['period'][0]);
            }
          });
        }
      });

      return summ / 6;
    }

    function calculateServices(services, selectedServices) {
      var bathhouseServices = _.flatten(_.pluck(services, 'services'));
      return _.reduce(selectedServices, function(sum, serviceId) {
        var item = _.find(bathhouseServices, function(service) { return service.id === serviceId});
        return sum + parseInt(item.price);
      }, 0);
    }
  }
}());