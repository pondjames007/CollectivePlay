// Open and connect socket
let socket = io();
let alphabet = '';

function setup() {
  createCanvas(windowWidth, windowHeight);
  background(255);

  // Select input and listen for changes
  //select("#username").input(usernameChanged);
  select("#alphabet").input(checkVowel);
  // Listen for confirmation of connection
  socket.on('connect', function () {
    console.log("Connected");
  });

  // Receive message from server
  socket.on('message', function (message) {
    //console.log(message);
    //let username = message.username;
    alphabet = message.data;

  });
}

function draw(){
    background(255);
    textSize(50);
    textAlign(CENTER);
    text('INPUT: ' + alphabet, width/2, height/2 - 75);
    if(alphabet.match(/[a-zA-Z]/)){
        if(alphabet.match(/[aeiouAEIOU]/)){
          text('this is: '+ alphabet + ".\n It is a vowel", width/2, height/2);
        }
        else{
          text('this is: '+ alphabet + ".\n It is a consonant", width/2, height/2);
        }
    }
}



// Send new username as it changes
function checkVowel(){
  socket.emit('alphabet', this.value());
}
