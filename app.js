var express = require('express'),
	sio = require('socket.io');

/*
 App
*/
var app = express.createServer();

app.configure(function(){
	app.use(express.static(__dirname + '/public'));
});

app.listen(80);

/*
 Socket.IO
*/
id = 1;
sockets = [];

io = sio.listen(app);
io.sockets.on('connection', function(socket) {
	var color = (function(i) {
		return ['red', 'blue', 'green', 'gray', 'purple'][i];
	})(parseInt(Math.random()*5));
	var data = socket.data = {
		id: id++,
		color: color,
		x: 0,
		y: 0
	};
	sockets[data.id] = data;
	
	socket.broadcast.emit('in', data);
	socket.emit('users', sockets);
	
	socket.on('move', function(x, y) {
		var data = socket.data;
		data.x += x;
		data.y += y;
		
		// do not send object to improve speed
		socket.broadcast.emit('move', data.id, data.x, data.y);
		socket.emit('move', data.id, data.x, data.y);
	});
	
	socket.on('disconnect', function() {
		var data = socket.data;
		if (!data.id) return;
		
		delete sockets[data.id];
		socket.broadcast.emit('out', data.id);
	});
});
