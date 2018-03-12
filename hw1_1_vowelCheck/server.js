// Create server
let port = process.env.PORT || 8000;
let express = require('express');
let app = express();
let server = require('http').createServer(app).listen(port, function () {
  console.log('Server listening at port: ', port);
});

// Tell server where to look for files
app.use(express.static('public'));

// Create socket connection
let io = require('socket.io').listen(server);

// Listen for individual clients to connect
io.sockets.on('connection',
  // Callback function on connection
  // Comes back with a socket object
  function (socket) {

    console.log("We have a new client: " + socket.id);

    // Listen for username
    // Stick the username on the socket object
    socket.on('alphabet', function(alphabet){
      socket.alphabet = alphabet;
      console.log(alphabet);
      if(alphabet[alphabet.length-1] == 'a' || alphabet[alphabet.length-1] == 'e' || alphabet[alphabet.length-1] == 'i' || alphabet[alphabet.length-1] == 'o' || alphabet == 'u'){
        console.log('this is: '+ alphabet[alphabet.length-1] + ". It is a vowel");
      }
      else{
        console.log('this is: '+ alphabet[alphabet.length-1] + ". It is a consonant");
      }

      let message = {
        //username: socket.username || '',
        data: alphabet[alphabet.length-1]
      }

      // Send it to all of the clients, including this one
      io.sockets.emit('message', message);
    });

    // Listen for this client to disconnect
    socket.on('disconnect', function () {
      console.log("Client has disconnected " + socket.id);
    });
  }
);
