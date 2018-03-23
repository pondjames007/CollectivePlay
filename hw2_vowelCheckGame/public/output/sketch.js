
let socket = io('/output');

socket.on('connect', function(){
    console.log("connected");
});

let users = {};
let time = 255;
let vowel, consonant;
let qns, ans, spd;

function setup(){
    createCanvas(windowWidth, windowHeight);
    vowel = createButton('VOWEL');
    vowel.position(width/2-200, height/2-25);
    vowel.size(100);
    vowel.mousePressed(checkTrue);
    consonant = createButton('CONSONANT');
    consonant.position(width/2+100, height/2-25);
    consonant.mousePressed(checkFalse);

    socket.on('question', function(message){
        let id = message.id;
        let question = message.data.question;
        let answer = message.data.answer;
        let speed = message.data.speed;


        if(!(id in users)){
            users[id] = {
                question: '',
                answer: '',
                speed: 0,
            }
        }
        users[id].speed = speed;
        users[id].question = question;
        users[id].answer = answer;
    });

    socket.on('next', function(id){
        if(!(id in users)){
            return;
        }
        users[id].question = ' ';
        users[id].answer = '';
    });

    socket.on('disconnected', function(id){
        delete users[id];
    });

}

function draw(){
    background(time);
    for(let id in users){
        let user = users[id];
        qns = user.question;
        ans = user.answer;
        spd = user.speed;

        textSize(50);
        textAlign(CENTER);
        text(qns, width/2, height/2);
        console.log(qns);
    }

    time -= 0.25;

    push()
    if(time <= 0){
        fill(150, 0, 0);
    }
    else{
        fill(time);
    }
    textSize(50);
    textAlign(CENTER);
    text("Game Over", width/2, height/2-50);
    pop()

    if(qns == ' '){
        time = 255;
    }
}

function checkTrue(){
    if(ans == true){
        time += spd;
    }
}

function checkFalse(){
    if(ans == false){
        time += spd;
    }
}
