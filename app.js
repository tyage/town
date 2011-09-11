var express = require('express'),
	sio = require('socket.io');

/*
 App
*/
var app = express.createServer();
app.configure(function() {
	app.set('views', __dirname + '/public')
});
