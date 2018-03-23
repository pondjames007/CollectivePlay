// Create server
let port = process.env.PORT || 8000;
let express = require('express');
let app = express();
let server = require('http').createServer(app).listen(port, function() {
    console.log('Server listening at port: ', port);
});

// Tell server where to look for files
app.use(express.static('public'));

// Create socket connection
let io = require('socket.io').listen(server);

// Clients in the different namespaces
var outputs = io.of('/output');
var inputs = io.of('/input');


outputs.on('connection', function(socket) {
    console.log('An output client connected: ' + socket.id);

    socket.on('disconnect', function() {
        console.log("An output client has disconnected: " + socket.id);
    });
});

// Listen for input clients to connect
inputs.on('connection', function(socket) {
    console.log('An input client connected: ' + socket.id);

    // Listen for motion data
    socket.on('accel', function(data) {
        let message = {
            id: socket.id,
            data: data
        }
        outputs.emit('movement', message);
    });

    // Listen for updates to usernames
    socket.on('username', function(data) {
        let message = {
            id: socket.id,
            data: data
        }
        outputs.emit('username', message);

    });
    
    // Listen for updates to setBrushSize
    socket.on('brushsize', function(data) {
        let message = {
            id: socket.id,
            brushsize: data
        }
        outputs.emit('brushsize', message);
    });
    
    // Listen for updates to setBrushSize
    socket.on('color_list', function(data) {
      
        let message = {
            id: socket.id,
            color_list: data
        }
        outputs.emit('color_list', message);
        console.log(message);
    });

    // Listen for this input client to disconnect
    socket.on('disconnect', function() {
        console.log("An input client has disconnected " + socket.id);
        outputs.emit('disconnected', socket.id);
    });
});