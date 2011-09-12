$(function() {
	var users = [];
	
	/*
		canvas
	*/
	var ctx = $('#world').get(0).getContext('2d');
	var drawWorld = function() {
		ctx.clearRect(0, 0, 500, 300);
		users.forEach(function(user) {
			if (!user) return true;
			drawUser(user);
		});
	};
	var drawUser = function(user) {
		ctx.fillRect(user.x, user.y, 50, 50);
	};
	
	/*
		Socket.IO
	*/
	var socket = io.connect();
	
	socket.on('users', function(userList) {
		users = userList;
		drawWorld();
	});
	socket.on('in', function(user) {
		users[user.id] = user;
		drawWorld();
	});
	socket.on('out', function(id) {
		delete users[id];
		drawWorld();
	});

	socket.on('move', function(id, x, y) {
		users[id].x = x;
		users[id].y = y;
		drawWorld();
	});
	
	/*
		User controll
	*/
	var margin = 5;
	$(window).keydown(function(e) {
		var key2move = {
			37: [-1, 0],
			38: [0, -1],
			39: [1, 0],
			40: [0, 1]
		};
		move = key2move[e.keyCode];
		if (!move) return false;
		
		socket.emit('move', move[0] * margin, move[1] * margin);
	});
});

