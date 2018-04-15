const express = require('express');
const app = express();
const fs = require('fs');
const https = require('http').Server(app);
const io = require('socket.io')(https);
const passport = require('passport');
const ejs = require('ejs');
const session = require('express-session');
const cookieParser = require('cookie-parser')
const giphy = require('giphy-api')('RklxX96Pbmo0rCoQea1ld3x8bfUmUgvt');

var messageID = {};
var users = {};
var counter = 0;
var gDataUser = {};
var keywords = {
	"amazing" : '<iframe src="https://giphy.com/embed/Fkmgse8OMKn9C" width="480" height="365" frameBorder="0" class="giphy-embed" allowFullScreen></iframe>'
};

passport.serializeUser(function(user, done) {
	done(null, user.id);
});

passport.deserializeUser(function(id, done) {
	done(null, gDataUser[id]);
});

app.use(express.static("public"));
app.set('view engine', 'ejs');
app.use(session({ secret: "cows." }));
app.use(cookieParser());
app.use(passport.initialize());
app.use(passport.session());

app.get('/', function(req, res){
  res.render('index');
});

app.get('/:id', (req, res) => {
  if (!req.user) {
    req.session.redirectToRoom = req.params.id;
    res.redirect('/auth/google');
  } else {
    res.render('room', { room: req.params.id.toLowerCase(), profile: req.user });
  }
})

io.on('connection', function(socket){
  console.log('a user connected');
  socket.on('join room', function(id){
    socket.join(id.roomId);
    if(!users[socket.id]) {
      users[socket.id] = { name: id.name, photo: id.photo, fullName: id.fullName, room: id.roomId };
    }
    socket.emit('online users', { users: users });
    io.to(id.roomId).emit('user joined', {user: users[socket.id]});
  });
  socket.on('interim', obj => {
    if(!messageID[socket.id]) {
      messageID[socket.id] = counter++;
    }
    var roomID = Object.keys(socket.rooms)[1];
    io.to(roomID).emit('interim update', { string: obj, id: messageID[socket.id], user: users[socket.id], target: socket.id} );
  });
  socket.on('file', obj => {
    // obj = { url: ..., name: ... }
    console.log('file upload');
    console.log(obj);
    var roomId = Object.keys(socket.rooms)[1];
    io.to(roomId).emit('file upload', { url: obj.url, uploader: users[socket.id], name: obj.name, target: socket.id });
  });
  socket.on('final', obj => {
    var msg = obj;
		var waitingForGIF = false;
    obj = obj.trim();
		if(obj.split(' ')[0]=='giphy') {
			waitingForGIF = true;
			var search = "";
			obj.split(' ').forEach(function (word) {
			     if(word!='giphy') {
			 		search += word + ' ';
                }
			});
			 giphy.search(search).then(function (res) {
			 	msg = '<iframe src="' + res.data[0].embed_url + '" width="480" height="365" frameBorder="0" class="giphy-embed" allowFullScreen></iframe>';
				var roomID = Object.keys(socket.rooms)[1];
		    io.to(roomID).emit('final update', { string: msg, id: messageID[socket.id], user: users[socket.id], target: socket.id} );
		    messageID[socket.id] = undefined;
				waitingForGIF = false;
			});
		}
		if(!waitingForGIF) {
			console.log(msg);
	    var roomID = Object.keys(socket.rooms)[1];
	    io.to(roomID).emit('final update', { string: msg, id: messageID[socket.id], user: users[socket.id], target: socket.id} );
	    messageID[socket.id] = undefined;
		}
  });
	socket.on('disconnect', () => {
    if (users[socket.id] != null) {
      var roomID = users[socket.id].room;

      io.to(roomID).emit('user left', {user: users[socket.id]});

      delete users[socket.id];
    }
	});
});

var GoogleStrategy = require('passport-google-oauth20').Strategy;

passport.use(new GoogleStrategy({
    clientID: "998277289939-80n1rq3l9uhjr643ugutnedj2ln01st6.apps.googleusercontent.com",
    clientSecret: "auiz-QSfxKC6I6LyJ_VkTzR0",
    callbackURL: "http://localhost:3000/auth/google/callback"
  },
  function(accessToken, refreshToken, profile, cb) {
    return cb(profile);
  }
));

app.get('/auth/google',
  passport.authenticate('google', { scope: ['profile'] }));

  app.get('/auth/google/callback',
  passport.authenticate('google'), // complete the authenticate using the google strategy
  (profile, req, res, next) => { // custom error handler to catch any errors, such as TokenError
    gDataUser[profile.id] = profile;
    req.login(profile, next);
  },
  (req, res) => { // On success, redirect back to '/'
    if (!req.session.redirectToRoom) {
      res.redirect('/testroom');
    } else {
      res.redirect('/' + req.session.redirectToRoom);
    }

  }
);

if (process.env.PRODUCTION == 1) {
	// Set the app to listen on port 80
  https.listen(443, () => {
		console.log("Listening on 443");
	});

  // Redirect http to https
  const http = express();
	http.get("*", (req, res) => {
		res.redirect("https://" + req.headers.host + req.url);
	});
	http.listen(80, () => console.log("Redirecting from port 80"));

} else {
  https.listen(3000, () => {
      console.log("listening on 3000");
  });
}
