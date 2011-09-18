$(function() {
	/*
		definition
	*/
	var World = {
		width: 500,
		height: 300,
		draw: function() {
			World.ctx.clearRect(0, 0, World.width, World.height);
			World.users.forEach(function(user) {
				if (!user) return true;
				user.draw();
			});
			World.drawBlocks();
		},
		blocks: [
			[0,0,1,1,1,1,1],
			[0,0,1,1,0,0,1],
			[0,0,1,1,0,0,1],
			[0,0,0,0,0,0,1],
			[0,0,0,0,0,0,1],
			[1,1,1,1,1,1,1],
		],
		blockHeight: 50,
		blockWidth: 50,
		drawBlocks: function() {
			World.blocks.forEach(function(blocks, y) {
				blocks.forEach(function(block, x) {
					if (!block) return true;
					
					World.ctx.fillRect(x * World.blockWidth, y * World.blockWidth, 
						World.blockHeight, World.blockWidth);
				})
			});
		},
		users: [],
		userHeight: 50,
		userWidth: 50,
		ctx: $('#world').get(0).getContext('2d')
	};
	
	var User = function(param) {
		this.id = param.id;
		this.pos = {
			x: param.x,
			y: param.y
		};
		this.color = param.color;
	};
	User.prototype.move = function(x, y) {
		var nextPos = {
			x: x,
			y: y
		};

		if (this.canMove(nextPos)) {
			this.pos = nextPos;
		}
	};
	User.prototype.canMove = function(pos) {
		var minBlockPos = {
			x: Math.floor(pos.x/World.blockWidth),
			y: Math.floor(pos.y/World.blockHeight)
		};
		var maxBlockPos = {
			x: Math.floor((pos.x + World.userWidth)/World.blockWidth),
			y: Math.floor((pos.y + World.userHeight)/World.blockHeight)
		};

		for (var y=minBlockPos.y;y<=maxBlockPos.y;++y) {
			for (var x=minBlockPos.x;x<=maxBlockPos.x;++x) {
				if (World.blocks[y][x]) {
					return false;
				}
			}
		}
		return true;
	};
	User.prototype.draw = function() {
		World.ctx.fillRect(this.pos.x, this.pos.y, World.userWidth, World.userHeight);
	};
	
	/*
		Socket.IO
	*/
	var socket = io.connect();
	socket.on('');
	socket.on('users', function(userList) {
		userList.forEach(function(user) {
			if (!user) return true;
			
			World.users[user.id] = new User(user);
		});
		World.draw();
	});
	socket.on('in', function(user) {
		World.users[user.id] = new User(user);
		World.draw();
	});
	socket.on('out', function(id) {
		delete World.users[id];
		World.draw();
	});

	socket.on('move', function(id, x, y) {
		World.users[id].move(x, y);
		World.draw();
	});
	
	/*
		User controll
	*/
	var margin = 2;
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

