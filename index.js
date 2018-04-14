const express = require('express');
const app = express();
const fs = require('fs');
var privateKey = fs.readFileSync('/etc/letsencrypt/live/transcri.me/privkey.pem', 'utf8');
var certificate = fs.readFileSync('/etc/letsencrypt/live/transcri.me/fullchain.pem', 'utf8');
var options = { key: privateKey, cert: certificate };
const https = require('https').createServer(options, app);
const io = require('socket.io')(https);
const passport = require('passport');
const ejs = require('ejs');
const session = require('express-session');
const cookieParser = require('cookie-parser')

var messageID = {};
var users = {};
var counter = 0;
var gDataUser = {};

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
    res.redirect('/auth/google'); 
  } else {
    res.render('room', { room: req.params.id, profile: req.user });
  }
})

io.on('connection', function(socket){
  console.log('a user connected');
  socket.on('join room', function(id){
    socket.join(id.roomId);
    if(!users[socket.id]) {
      users[socket.id] = { name: id.name, photo: id.photo };
    }
    io.to(id).emit('room msg', {msg: 'Welcome to the room'});
  });
  socket.on('interim', obj => {
    if(!messageID[socket.id]) {
      messageID[socket.id] = counter++;
    }
    var roomID = Object.keys(socket.rooms)[1];
    io.to(roomID).emit('interim update', { string: obj, id: messageID[socket.id], user: users[socket.id], target: socket.id} );
  });
  socket.on('final', obj => {
    var roomID = Object.keys(socket.rooms)[1];
    io.to(roomID).emit('final update', { string: obj, id: messageID[socket.id], user: users[socket.id], target: socket.id} );
    messageID[socket.id] = undefined;
  });
});

var GoogleStrategy = require('passport-google-oauth20').Strategy;

passport.use(new GoogleStrategy({
    clientID: "998277289939-80n1rq3l9uhjr643ugutnedj2ln01st6.apps.googleusercontent.com",
    clientSecret: "auiz-QSfxKC6I6LyJ_VkTzR0",
    callbackURL: "https://transcri.me/auth/google/callback"
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
    res.redirect('/testroom');
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
  http.listen(3000, () => {
      console.log("listening on 3000");
  });
}
