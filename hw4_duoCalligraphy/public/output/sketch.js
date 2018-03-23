// Open and connect input socket
let socket = io('/output');

// Listen for confirmation of connection
socket.on('connect', function() {
    console.log("Connected");
});

// Keep track of partners
let users = {};
// Keep track of average position
let avgPos, pAvgPos, vel, friction;
let acc, pAcc;
let canDraw = false;

function setup() {
    createCanvas(windowWidth, windowHeight);
    // Calculate avgPos of users
    avgPos = createVector(width / 2, height / 2)
    pAvgPos = avgPos.copy();
    vel = createVector();

    // Listen for message
    socket.on('message', function(message) {
        let id = message.id;
        let data = message.data;

        // Update position of user in room
        // Scaled to output screen size
        users[id] = {
            vel: createVector(-data.angY / 20, data.angX / 20)
        };
    });

    // Remove disconnected users
    socket.on('disconnected', function(id) {
        delete users[id];
    });
}

function draw() {

    let num = 0;
    // Previous user
    let puser;
    let avgVel = createVector();
    // Loop through users to calculate average position
    // and check distance between users
    for (let u in users) {
        let user = users[u];
        avgVel.sub(user.vel);
        num++;
    }
    if (num > 0) {
        avgVel.div(num);
        if (avgVel.y > 0)
            avgVel.x *= -1;
    }

    avgPos.add(avgVel);


    avgPos.x = constrain(avgPos.x, 0, width);
    avgPos.y = constrain(avgPos.y, 0, height);

    // Only draw if there's a previous average position
    // And more than 1 person is drawing
    strokeWeight(5);
    if (pAvgPos && num > 1) {
        // Draw line of average positions
        line(pAvgPos.x, pAvgPos.y, avgPos.x, avgPos.y);
    } else {
        background(255);
        point(pAvgPos.x, pAvgPos.y);
    }
    // Remember average position for next frame
    pAvgPos = avgPos;
}