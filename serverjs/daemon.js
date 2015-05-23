var server = require('http').createServer(),
  _ = require('lodash'),
  io = require('socket.io')(server),
  mysql = require('mysql'),
  monitorio = require('monitor.io'),
  moment = require('moment'),
  cities = [],
  bathhouses = [],
  people = {},
  managers = {},
  reservs = [],
  pages = ['list', 'detail', 'manager'];

var connection = mysql.createConnection({
  host     : 'localhost',
  user     : 'root',
  password : 'root',
  database : 'ordrDB'
});

connection.connect();

var queryBathhouses = '' +
  'SELECT ' +
    'bathhouse_detail.id, city.slug ' +
  'FROM ' +
    'bathhouse_detail ' +
    'INNER JOIN city ON city.id = bathhouse_detail.city_id';

connection.query(queryBathhouses, function(err, rows, fields) {
  if (err) throw err;

  bathhouses = rows;
});

var queryCities = '' +
  'SELECT ' +
    'city.id, city.slug ' +
  'FROM ' +
    'city';

connection.query(queryCities, function(err, rows, fields) {
  if (err) throw err;

  cities = rows;
});

connection.end();

var periods = {
  '00:00': 0, '00:30': 3, '01:00': 6, '01:30': 9,
  '02:00': 12, '02:30': 15, '03:00': 18, '03:30': 21,
  '04:00': 24, '04:30': 27, '05:00': 30, '05:30': 33,
  '06:00': 36, '06:30': 39, '07:00': 42, '07:30': 45,
  '08:00': 48, '08:30': 51, '09:00': 54, '09:30': 57,
  '10:00': 60, '10:30': 63, '11:00': 66, '11:30': 69,
  '12:00': 72, '12:30': 75, '13:00': 78, '13:30': 81,
  '14:00': 84, '14:30': 87, '15:00': 90, '15:30': 93,
  '16:00': 96, '16:30': 99, '17:00': 102, '17:30': 105,
  '18:00': 108, '18:30': 111, '19:00': 114, '19:30': 117,
  '20:00': 120, '20:30': 123, '21:00': 126, '21:30': 129,
  '22:00': 132, '22:30': 135, '23:00': 138, '23:30': 141
};

var period_first = 0,
    period_last = 141;

//io.use(monitorio({ port: 8000 }));

server.listen(3000);

io.sockets.on('connection', function(socket) {

  // Добавляем манагера в общий пак сокетов
  socket.on('manager:init', function(managerData) {
    socket.city = managerData.city;
    socket.bathhouseId = managerData.organization_id;

    managers[managerData.organization_id] = socket;
  });

  // Все манипуляции манагера с заказами
  socket.on('manager:actionOrder', function(orderData) {

    var result = {};

    result = {
      roomId: orderData.roomId,
      orders: {}
    };

    if (moment(orderData.startDate).isSame(orderData.endDate)) {
      result.orders[orderData.startDate] = {
        bathhouseId: orderData.bathhouseId,
        startPeriodId: orderData.startPeriodId,
        endPeriodId: orderData.endPeriodId,
        status: orderData.status
      };
    }
    else {

      result.orders[orderData.startDate] = {
        bathhouseId: orderData.bathhouseId,
        roomId: orderData.roomId,
        startPeriodId: orderData.startPeriodId,
        endPeriodId: 144,
        status: orderData.status
      };

      result.orders[orderData.endDate] = {
        bathhouseId: orderData.bathhouseId,
        roomId: orderData.roomId,
        startPeriodId: 0,
        endPeriodId: orderData.endPeriodId,
        status: orderData.status
      };
    }

    console.log(result);
    io.sockets.in(socket.city).emit('daemon:actionOrder', result);
  });

  socket.on('manager:getReserveOrders', function(callback) {
    var orders = _.where(reservs, function(order) { return order.bathhouseId === parseInt(socket.bathhouseId); });
    callback(orders);
  });

  socket.on('user:init', function(userData) {

    // Со страницы list
    if (userData.hasOwnProperty('city')) {
      socket.room = userData.city;
      socket.join(userData.city);
    }

    // Со страницы detail
    else if (userData.hasOwnProperty('bathhouseId')) {
      var city = _.find(bathhouses, function(bathhouse) { return bathhouse.id === parseInt(userData.bathhouseId); });
      socket.room = city.slug;
      socket.join(city.slug);
    }
  });

  socket.on('user:reserveOrder', function(orderData) {

    if (!_.isArray(reservs[socket.room])) {
      reservs[socket.room] = [];
    }

    reservs[socket.room].push(orderData);

    io.sockets.in(socket.room).emit('daemon:reserveOrder', orderData);

    if (!_.isUndefined(managers[orderData.bathhouseId]))
      managers[orderData.bathhouseId].emit('daemon:reserveOrder', orderData);
  });

  socket.on('user:cancelOrder', function(orderData) {
    io.sockets.in(socket.room).emit('daemon:cancelOrder', orderData);

    if (!_.isUndefined(managers[orderData.bathhouseId]))
      managers[orderData.bathhouseId].emit('daemon:cancelOrder', orderData);
  });

  socket.on('user:confirmOrder', function(orderData) {
    io.sockets.in(socket.room).emit('daemon:confirmOrder', orderData);

    if (!_.isUndefined(managers[orderData.bathhouseId]))
      managers[orderData.bathhouseId].emit('daemon:confirmOrder', orderData);
  });

  socket.on('user:getReserveOrders', function(data, callback) {

    var orders = [];

    // Со страницы list
    if (data.hasOwnProperty('city')) {
      var bathhousesByCity = _.where(bathhouses, function(bathhouse) { return bathhouse.city === data.city; });

      _(bathhousesByCity).forEach(function(bathhouse) {
        var bathhouseOrders = _.where(reservs, function(order) { return order.bathhouseId === parseInt(bathhouse.id); });
        orders.concat(bathhouseOrders);
      });
    }

    // Со страницы detail
    else if (data.hasOwnProperty('bathhouseId')) {
      orders = _.where(reservs, function(order) { return order.bathhouseId === parseInt(data.bathhouseId); });
    }

    callback(orders);
  });

  socket.on('user:changeCity', function(cityId, callback) {
    socket.leave(socket.room);

    var city = _.find(cities, function(city) { return city.id === parseInt(cityId); });

    socket.room = city.slug;
    socket.join(city.slug);

    var orders = _.where(reservs, function(order) { return order.slug === city.slug; });

    callback(orders);
  });

  socket.on('disconnect', function() {

  });
});