const express = require('express');
const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http);

var messageID = {};
var users = {};
var counter = 0;

app.use(express.static("public"));

app.get('/', function(req, res){

});

io.on('connection', function(socket){
  console.log('a user connected');
  socket.on('join room', function(id){
    socket.join(id.roomId);
    if(!users[socket.id]) {
      users[socket.id] = { name: id.name };
    }
    io.to(id).emit('room msg', {msg: 'Welcome to the room'});
    console.log('Socket connected to room ' + id.roomId);
  });
  socket.on('interim', obj => {
    console.log('Emitting interim: ' + obj);
    if(!messageID[socket.id]) {
      messageID[socket.id] = counter++;
    }
    var roomID = Object.keys(socket.rooms)[1];
    io.to(roomID).emit('interim update', { string: obj, id: messageID[socket.id], user: users[socket.id]} );
  });
  socket.on('final', obj => {
    var roomID = Object.keys(socket.rooms)[1];
    io.to(roomID).emit('final update', { string: obj, id: messageID[socket.id], user: users[socket.id]} );
    messageID[socket.id] = undefined;
  });
});



http.listen(3000, () => {
    console.log("listening on 3000");
})


//'final'


// newMessagesBuffer[];
// { { speaker: "Person 1", speach: "Hello", p: 0.8 }, { speaker: "Person 2", speach: "Hello", p: 0.4 }, { speaker: "Person 2", speach: "Banana", p: 0.4 } }

// t = 0 -> Person 1: { speach: "Hello", p: 0.8 }
//    setTimeout(function() {
//
//    }, 300)
// t = 100 -> Person 2: { speach: "Hello", p: 0.4 }
