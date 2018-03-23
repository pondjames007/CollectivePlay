// Open and connect input socket
let socket = io('/input');

// Listen for confirmation of connection
socket.on('connect', function() {
    console.log("Connected");
});


function setup() {
    createCanvas(windowWidth, windowHeight);

}

function draw() {
    background(0);

    let angY = floor(rotationY);
    //angZ = constrain(angZ, -90, 90);
    //angZ = map(angZ, 90, -90, 0, 180);
    // Send proportional, normalized mouse data
    let angX = rotationX;
    angX = constrain(angX, 0, 180);
    angX = map(angX, 0, 180, -90, 90);
    angX = floor(angX);


    //console.log(acc.x + "  " + acc.y + "  " + ang);
    socket.emit('data', {
        angX: angX,
        angY: angY
    });
}