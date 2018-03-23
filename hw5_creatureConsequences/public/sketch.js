// Open and connect input socket
let socket = io();

// String being typed
let str = '';
// Is it my turn?
let myTurn = false;
// Canvas element
let cnv;
// Margin;
let m = 10;
let finish = false;
let rectangles = [];
let sliders = [];
let sliderValue = [0, 3, 1];
let timer = 5;
let queue;
let words = ['a head', 'a torso', 'waist to knees', 'knees to feet'];

function setup() {
    cnv = createCanvas(windowWidth, windowHeight);
    // Disable canvas by deafult
    cnv.addClass('disabled');

    for (let i = 0; i < 4; i++) {
        rectangle = document.getElementById('rect' + i);
        rectangle.style.width = windowWidth + 'px';
        rectangle.style.height = windowHeight / 4 + 'px';
        rectangle.style.top = windowHeight * i / 4 + 'px';
        rectangles.push(rectangle);
        textAlign(LEFT, TOP);
        textSize(16);
        text("It's your turn! Draw " + words[i] + ".\nPress Return when you are finished.", 10, windowHeight * i / 4);
    }

    //putSliders();

    textAlign(RIGHT, TOP);
    textSize(32);
    text("Creature Consequences", windowWidth, 0);
    // Listen for confirmation of connection
    socket.on('connect', function() {
        console.log("Connected");
    });

    // Listen for my turn
    socket.on('go', function(q) {
        myTurn = true;
        console.log(q);
        queue = q;
        // Enable canvas
        cnv.removeClass('disabled');
        // Update instructions on screen
        rectangles[q].style.visibility = 'hidden';
        putSliders(q, q);
    });

    socket.on('sliderValue', function(data) {
        console.log(data);
        for (let i = 0; i < 3; i++) {
            let slider = document.getElementById('slider' + i);
            slider.childNodes[3].value = data[i];
        }
        sliderValue = data;
    });

    socket.on('IAmDrawing', function(data) {
        //console.log(sliderValue);
        push()
        let col = color('hsba(' + sliderValue[0] + ',100%, 100%,' + sliderValue[2] + ')');
        stroke(col);
        strokeWeight(parseInt(sliderValue[1]));
        line(data.x * width, data.y * height, data.px * width, data.py * height);
        pop()
    });

    socket.on('revealCreature', function(data) {
        for (let i = 0; i < 4; i++) {
            rectangles[i].style.visibility = data;
        }
    });

    socket.on('restart', function() {
        background(255);
        for (let i = 0; i < 4; i++) {
            rectangles[i].style.visibility = 'visible';
            textAlign(LEFT, TOP);
            textSize(16);
            text("It's your turn! Draw " + words[i] + ".\nPress Return when you are finished.", 10, windowHeight * i / 4);
        }
    });

    socket.on('showSlider', function(q, idx) {
        putSliders(q, idx);
    });
}

function putSliders(q, idx) {
    let now = q;
    for (let i = 0; i < 3; i++) {
        now++;
        let slider = document.getElementById('slider' + i);
        slider.style.top = (windowHeight / 4 * (now % 4) + windowHeight / 8) + 'px';
        slider.style.left = (windowWidth / 2 - 150) + 'px';
        if (now % 4 == idx) {
            console.log(idx + "   is here");
            slider.style.visibility = 'visible';
        } else {
            slider.style.visibility = 'hidden';
        }
        //console.log('sliderAssigned:' + slider.childNodes);
    }

}

function mouseDragged() {
    if (myTurn == true) {
        mouseX = constrain(mouseX, 0, width);
        mouseY = constrain(mouseY, windowHeight / 4 * queue, windowHeight / 4 * (queue + 1) + 20);
        pmouseX = constrain(pmouseX, 0, width);
        pmouseY = constrain(pmouseY, windowHeight / 4 * queue, windowHeight / 4 * (queue + 1) + 20);
        socket.emit('drawing', mouseX / width, mouseY / height, pmouseX / width, pmouseY / height);
    } else {
        for (let i = 0; i < 3; i++) {
            let slider = document.getElementById('slider' + i);
            sliders.push(slider.childNodes[3].value);
        }
        //console.log("i changed the value: " + sliders)
        socket.emit('sliderChange', sliders);
        sliders = [];
    }
}


function keyPressed() {
    if (!myTurn) return;
    if (keyCode == ENTER) {
        if (queue == 3) {
            socket.emit('reveal', 'hidden');
            finish = true;
            return;
        }

        socket.emit('next');
        myTurn = false;
        rectangles[queue].style.visibility = 'visible';
    }

    if (key == ' ' && queue == 3 && finsih == true) {
        //console.log('here');
        socket.emit('refresh');
        socket.emit('next');
        myTurn = false;
    }
}