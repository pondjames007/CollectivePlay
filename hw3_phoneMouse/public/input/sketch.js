// TODO: add self finding ping / bounce / jiggle button

// Open and connect socket
let socket = io('/input');
// instantiate timestamps to calculate delta
let timestamp = 10, ptimestamp = 0;
let pos_x = 0, pos_y = 0;
let velo_x = 0, velo_y = 0
let smth_accel_x = 0, smth_accel_y = 0;
let brushsize, color;
let color_list;

let W,H;
let short_edge;

function setup(){
    let colors = ["#e6194b", "#3cb44b", "#ffe119", "#0082c8", "#f58231", "#911eb4", "#46f0f0", "#f032e6", "#d2f53c", "#fabebe", "#008080", "#e6beff", "#aa6e28", "#fffac8", "#800000", "#aaffc3", "#808000", "#ffd8b1", "#000080", "#808080", "#FFFFFF", "#000000"];
    color_list = [random(colors), random(colors)];
    socket.emit("color_list", color_list);
    W = windowWidth - 50;
  H = windowHeight - 50;
  short_edge = W < H ? W : H;
  createCanvas(short_edge, short_edge);
  background(128);
  
  let fill_color = color_list[0];
  let stroke_color = color_list[1];
  
  strokeWeight(short_edge *.10);
  fill(fill_color);
  stroke(stroke_color);
  ellipse(short_edge / 2, short_edge / 2, short_edge * .75);
}
// Send brush size as it changes
function sliderChanged(){
  console.log("brush" + this.value());
  socket.emit('brushsize', this.value());
  brushsize = this.value();
}

function draw(){
    // update time variables and get time delta in SI units, seconds
    timestamp = millis();
  
  // replace all of this with...
  // https://p5js.org/reference/#/p5/rotationX
    let delta_millis = timestamp - ptimestamp;
    let delta_seconds = delta_millis / 1000;
  
    // smooth acceleration with simple linear interpolation
    let weight = .05;
    smth_accel_x = smth_accel_x * (1-weight) + accelerationX * weight;
    // TODO: expermenting with using Z instead, like remote control
    smth_accel_y = smth_accel_y * (1-weight) + accelerationZ * weight;
  
    // integrate acceleration to get velocity
    velo_x = velo_x + smth_accel_x * delta_seconds;
    velo_y = velo_y + smth_accel_y * delta_seconds;
  
    // calculate new position from last position, velocity, and acceleration
    // TODO: i think my understanding of physics is wrong
    // TODO: look at nature of code
    let move_x = velo_x * delta_seconds + .5 * smth_accel_x * delta_seconds**2;
    let move_y = velo_y * delta_seconds + .5 * smth_accel_y * delta_seconds**2;
  
    // exagerate movement
    pos_x += move_x * 100;
    pos_y += move_y * 100;
  
    // limit output to 10x10
    pos_x = constrain(pos_x, -10, 10);
    pos_y = constrain(pos_y, -10, 10);
  
    // wrap around
    pos_x = pos_x == -10 ? 10 : pos_x == 10 ? -10 : pos_x;
    pos_y = pos_y == -10 ? 10 : pos_y == 10 ? -10 : pos_y;
  
    // TODO: testing friction here. still seeing bounce.
    velo_x = velo_x * .95;
    velo_y = velo_y * .95;
    
    // pitch
    let lr = floor(rotationY);
    // Ignore flipped over device
    lr = constrain(lr, -90, 90);
    let pitch = map(lr, -90, 90, 100,1000)
    
    // build data packet and send
    let packet = {
      "x": pos_x,
      "y": pos_y,
      "pitch": pitch
    }
    socket.emit("accel", packet);

    // set prev timestamp for next draw cycle
    ptimestamp = timestamp;
}