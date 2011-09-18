$(function() {
	/*
		Game
	*/
	var Init = {};
	var Users = [];
	var Canvas = {
		draw: function() {
			Canvas.ctx.clearRect(0, 0, Init.worldWidth, Init.worldHeight);
			Users.forEach(function(user) {
				if (!user) return true;
				user.draw();
			});
			Canvas.drawBlocks();
		},
		drawBlocks: function() {
			Init.blocks.forEach(function(blocks, y) {
				blocks.forEach(function(block, x) {
					if (!block) return true;
					
					Canvas.ctx.fillRect(x * Init.blockWidth, y * Init.blockWidth, 
						Init.blockHeight, Init.blockWidth);
				})
			});
		},
		ctx: $('#world').get(0).getContext('2d')
	};
	
	var User = function(param) {
		this.id = param.id;
		this.pos = {
			x: param.pos.x,
			y: param.pos.y
		};
		this.color = param.color;
	};
	User.prototype = {
		draw: function() {
			Canvas.ctx.fillRect(this.pos.x, this.pos.y, Init.userWidth, Init.userHeight);
		},
		move: function(pos) {
			this.pos = pos;
		}
	};
	
	/*
		Socket.IO
	*/
	var socket = io.connect();
	
	socket.on('init', function(init) {
		Init = init;
	});
	socket.on('users', function(users) {
		users.forEach(function(user) {
			if (!user) return true;
			
			Users[user.id] = new User(user);
		});
		Canvas.draw();
	});
	socket.on('in', function(user) {
		Users[user.id] = new User(user);
		Canvas.draw();
	});
	socket.on('out', function(id) {
		delete Users[id];
		Canvas.draw();
	});
	socket.on('move', function(id, pos) {
		Users[id].move(pos);
		Canvas.draw();
	});
	
	/*
		User controll
	*/
	(function() {
		var keydown = {
			37: false,
			38: false,
			39: false,
			40: false
		};
		var key2move = {
			37: [-1, 0],
			38: [0, -1],
			39: [1, 0],
			40: [0, 1]
		};
		var move = {x: 0, y: 0};
		
		setInterval(function() {
			if (move.x || move.y) {
				socket.emit('move', move);
			}
		}, 40);
		
		$(window).keydown(function(e) {
			key = e.keyCode;
			if (!key2move[key] || keydown[key]) return;
			
			keydown[key] = true;
			move.x += key2move[key][0];
			move.y += key2move[key][1];
		});
		$(window).keyup(function(e) {
			key = e.keyCode;
			if (!key2move[key]) return;
			
			keydown[key] = false;
			move.x -= key2move[key][0];
			move.y -= key2move[key][1];
		});
	})();
});

