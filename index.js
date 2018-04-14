const express = require('express');
const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http);

app.use(express.static("public"));

app.get('/', function(req, res){

});

io.on('connection', function(socket){
  console.log('a user connected');
});

http.listen(3000, () => {
    console.log("listening on 3000");
})


// var buffer = [];
// socket.on('new word', (obj) => {
//     buffer.push(obj);
//     setTimeout(() => {
//         // After 300 ms
//         for (var i = 0; i < buffer.length; i++) {
//             // Find the obj that has highest p
//             // Remove all objs that have the same word
//         }
//     }, 300);
// })

// newMessagesBuffer[];
// { { speaker: "Person 1", speach: "Hello", p: 0.8 }, { speaker: "Person 2", speach: "Hello", p: 0.4 }, { speaker: "Person 2", speach: "Banana", p: 0.4 } }

// t = 0 -> Person 1: { speach: "Hello", p: 0.8 }
//    setTimeout(function() {
//
//    }, 300)
// t = 100 -> Person 2: { speach: "Hello", p: 0.4 }
