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

// Keep track of queue
let queue = [];
let q = -1;
let current;
let time = new Date();

// Listen for individual clients to connect
io.sockets.on('connection',
    // Callback function on connection
    // Comes back with a socket object
    function(socket) {

        console.log("We have a new client: " + socket.id);
        //console.log(time.getTime());
        // Add socket to queue
        queue.push(socket);
        queue[queue.length - 1].emit('showSlider', q, queue.length - 1);
        // Kick off queue as soon as there's 1 person in line
        if (q < 0 && queue.length > 1) {
            next();
        }


        socket.on('drawing', function(x, y, px, py) {
            let data = {
                x: x,
                y: y,
                px: px,
                py: py
            }
            io.sockets.emit('IAmDrawing', data);
        });

        socket.on('reveal', function(data) {
            io.sockets.emit('revealCreature', data);
            io.sockets.emit('showSlider', 0, -1)
        });

        socket.on('refresh', function() {
            io.sockets.emit('restart');
        });

        socket.on('sliderChange', function(data) {
            io.sockets.emit('sliderValue', data);
            console.log(data);
        });
        // Ready for next
        socket.on('next', function() {
            next();
        });

        // Listen for this client to disconnect
        // Tell everyone client has disconnected
        socket.on('disconnect', function() {
            io.sockets.emit('disconnected', socket.id);
            // Remove socket from queue
            for (let s = 0; s < queue.length; s++) {
                if (queue[s].id == socket.id) {
                    queue.splice(s, 1);
                }
            }
            // If current client disconnected, move onto next client
            if (socket === current) {
                q--;
                next();
            }

            for (let idx in queue) {
                if (idx != q) {
                    queue[idx].emit('showSlider', q, idx);
                }
            }
        });

        //setTimeout(next, 3000);
    });

// Get next client
function next() {
    // Move to next person in line
    q++;
    q %= queue.length;
    console.log("NEXT UP: ", q);
    for (let idx in queue) {
        if (idx != q) {
            console.log(idx);
            queue[idx].emit('showSlider', q, idx);
        }
    }
    current = queue[q];
    current.emit('go', q);

}