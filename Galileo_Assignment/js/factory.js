app.factory('socket', function ($rootScope) {
  var socket = io.connect();
  return {
    dashboard: function(){
		socket.on('message',function(data){
			console.log(JSON.stringify(data));
			return data;
		});
		},

    on: function (eventName, callback) {
      socket.on(eventName, function () {  
        var args = arguments;
        $rootScope.$apply(function () {
          callback.apply(socket, args);
        });
      });
    },
    emit: function (eventName, data, callback) {
      socket.emit(eventName, data, function () {
        var args = arguments;
        $rootScope.$apply(function () {
          if (callback) {
            callback.apply(socket, args);
          }
        });
      })
    }
  };
});