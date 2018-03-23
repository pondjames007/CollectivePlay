
let socket = io('/input');

socket.on('connect', function(){
    console.log("connected");
});

let lastTypedTime = 0;
let answer = true;
let str = '';

function setup(){
    createCanvas(windowWidth, windowHeight);
    textAlign(CENTER, CENTER);
}

function draw(){
    background(255);
    textSize(128);
    text(str, width/2, height/2);
}


function keyTyped(){
    let now = millis();
    if(key == ' '){
        str = key;
        socket.emit('next');
        lastTypedTime = now;
        return;
    }

    if(key.match(/[A-Za-z]/)){
      if(key.match(/[aeiouAEIOU]/)){
        answer = true;
      }
      else{
        answer = false;
      }

      let message = {
          question: key,
          answer: answer,
          speed: 1000/(now - lastTypedTime)
      };
      socket.emit('question', message);
      lastTypedTime = now;
      str = key;
    }
    else{
        str = '';
    }

}
