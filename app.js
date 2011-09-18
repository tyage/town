//var express = require('express'),
//	sio = require('socket.io');
var express = require('C:/Documents and Settings/admin/node_modules/express'),
	sio = require('C:/Documents and Settings/admin/node_modules/socket.io');

/*
 App
*/
var app = express.createServer();

app.configure(function(){
	//app.use(express.static(__dirname + '/public'));
	app.use(express.static(__dirname + '\\public'));
});

app.listen(80);

/*
	Game
*/
var Init = {
	worldWidth: 500,
	worldHeight: 500,
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
	userHeight: 50,
	userWidth: 50
};
var UserId = 0;
var Users = [];
var User = function() {
	this.id = UserId++;
	this.color = (function(i) {
		return ['red', 'blue', 'green', 'gray', 'purple'][i];
	})(parseInt(Math.random()*5));
	this.pos = {
		x: 0,
		y: 0
	};
	this.step = 3;
};
User.prototype = {
	getData: function() {
		return {
			id: this.id,
			color: this.color,
			pos: this.pos
		};
	},
	move: function(direction) {
		var nextPos = {
			x: this.pos.x + direction.x * this.step,
			y: this.pos.y + direction.y * this.step
		};

		var block = this.blocked({
			x: nextPos.x,
			y: this.pos.y
		});
		if (block) {
			this.pos.x = block.x * Init.blockWidth < this.pos.x ? 
				block.x * Init.blockWidth + Init.blockWidth : 
				block.x * Init.blockWidth - Init.userWidth;
		} else {
			this.pos.x = nextPos.x;
		}
		
		var block = this.blocked({
			x: this.pos.x,
			y: nextPos.y
		});
		if (block) {
			this.pos.y = block.y * Init.blockHeight < this.pos.y ? 
				block.y * Init.blockHeight + Init.blockHeight : 
				block.y * Init.blockHeight - Init.userHeight;
		} else {
			this.pos.y = nextPos.y;
		}
	},
	blocked: function(pos) {
		var minBlockPos = {
			x: Math.floor((pos.x + 1) / Init.blockWidth),
			y: Math.floor((pos.y + 1) / Init.blockHeight)
		};
		var maxBlockPos = {
			x: Math.floor((pos.x + Init.userWidth - 1) / Init.blockWidth),
			y: Math.floor((pos.y + Init.userHeight - 1) / Init.blockHeight)
		};

		for (var y=minBlockPos.y;y<=maxBlockPos.y;++y) {
			for (var x=minBlockPos.x;x<=maxBlockPos.x;++x) {
				if (!Init.blocks[y] || Init.blocks[y][x] != 0) {
					return {
						x: x,
						y: y
					};
				}
			}
		}
		return false;
	}
};

/*
 Socket.IO
*/
io = sio.listen(app);
io.sockets.on('connection', function(socket) {
	var user = socket.user = new User();
	Users[user.id] = user;
	
	socket.broadcast.emit('in', user.getData());
	socket.emit('init', Init);
	socket.emit('users', (function() {
		var data = [];
		Users.forEach(function(user) {
			data.push(user.getData());
		});
		return data;
	})());
	
	socket.on('move', function(direction) {
		user.move(direction);
		
		socket.broadcast.emit('move', user.id, user.pos);
		socket.emit('move', user.id, user.pos);
	});
	
	socket.on('disconnect', function() {
		delete Users[user.id];
		
		socket.broadcast.emit('out', user.id);
	});
});
