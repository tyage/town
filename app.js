var express = require('express'),
	io = require('socket.io');

/*
 App
*/
var app = express.createServer();
app.configure(function(){
	app.use(express.static(__dirname + '/public'));
});
app.listen(80);

