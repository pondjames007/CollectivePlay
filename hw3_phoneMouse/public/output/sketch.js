// Open and connect socket
let socket = io('/output');

let users = {};

var W,H;
let short_edge;

function setup(){

  W = windowWidth - 50;
  H = windowHeight - 50;
  short_edge = W < H ? W : H;

  createCanvas(short_edge, short_edge);
  background(128);
 
    socket.on('movement', function(data) {

      let id = data.id;
      let pitch = data.data.pitch;

      if (!(id in users)) {
        setupUser(id);
      }

      let user = users[id];

      user.pos.x = map(data.data.x, -10,10,short_edge,0);
      user.pos.y = map(data.data.y, -10,10,0,short_edge);

      user.osc.freq(pitch);
    });

    // Listen for updates to usernames
    socket.on('username', function (data) {
      let id = data.id;
      let username = data.username;

      if(!(id in users)){
        setupUser(id);
      }

      users[id].username = username;

    });

    // Listen for updates to setBrushSize
    socket.on('brushsize', function(data){
      let id = data.id;
      let brushsize = data.brushsize;

      if(!(id in users)){
        setupUser(id);
      }

      users[id].brushsize = brushsize;
      users[id].osc.amp(map(brushsize, 1, 50, 0, 1));
    });
    
    socket.on('color_list', function(data){
      let id = data.id;
      let colors = data.color_list;
      
      if(!(id in users)){
        setupUser(id);
      }
    
      users[id].fill = colors[0];
      users[id].stroke = colors[1];
    });
              
    socket.on('disconnected', function(id){
        // users[id].osc.stop();
        delete users[id];
      });
}
function setupUser(id){
    users[id] = {
      "pos": {
          "x": W/2,
          "y": H/2
      },
      "fill": "#000",
      "stroke": "#333",
      "username": "Hello",
      "brushsize":50,
      "osc": new p5.Oscillator()
    };

    // set up osc
    let osc = users[id].osc;
    let effect = users[id].effect;
    osc.start(0);
    osc.setType('saw');
    osc.freq(240);
    osc.amp(map(users[id].brushsize, 1, 50, 0, 1));
}

function draw(){
  background(128);
  for (let user in users) {
    strokeWeight(20);
    stroke(users[user]["stroke"]);
    fill(users[user]["fill"]);
    ellipse(users[user].pos.x, users[user].pos.y, users[user].brushsize);
    //console.log(users[user].brushsize);
  }

}
