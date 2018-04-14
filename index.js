import { EIO } from 'constants';

const app = require('express')();

const io = require('socket.io');

app.use(express.static("public"));

app.listen(3000, () => { console.log("Listening on 3000"); });


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