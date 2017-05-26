const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const path = require('path');
const Session = require('express-session');

const app = express();
const router = express.Router();
const port = process.env.API_PORT || 3001;

const {dbUser, dbPassword, dbUrl} = require('../config/database');
const {web} = require('../config/youtube');
const {client_id, project_id, auth_uri, token_uri, client_secret} = web;

const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;

const User = require('./models/user');
const {isSubscribed} = require('./services/youtube');

const {
  getComments,
  createComment,
  likeComment,
  getLikes,
  deleteComment,
  removeAllLikes,
  removeAllComments
} = require('./controllers/commentsController');

const {retrieveUsers, deleteUsers} = require('./controllers/userController');

const DB_CONNECTION_URL = `mongodb://${dbUser}:${dbPassword}${dbUrl}`;

mongoose.connect(DB_CONNECTION_URL, (err) => {
	if (err) {
		return console.error(new Error('A problem occured while connecting to database!'));
	}
	return console.log('Succesfully connected to database');
});

app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use(function(req, res, next) {
 res.setHeader('Access-Control-Allow-Origin', '*');
 res.setHeader('Access-Control-Allow-Credentials', 'true');
 res.setHeader('Access-Control-Allow-Methods', 'GET,HEAD,OPTIONS,POST,PUT,DELETE');
 res.setHeader('Access-Control-Allow-Headers', 'Access-Control-Allow-Headers, Origin,Accept, X-Requested-With, Content-Type, Access-Control-Request-Method, Access-Control-Request-Headers');
 res.setHeader('Cache-Control', 'no-cache');
 next();
});

app.use(function(req, res, next) {
  console.log(req.originalUrl);
  next();
});

app.use(Session({ secret: 'the skeets' }));
app.use(passport.initialize());
app.use(passport.session());

// used to serialize the user for the session
passport.serializeUser(function(user, done) {
    done(null, user.id);
});

// used to deserialize the user
passport.deserializeUser(function(id, done) {
    User.findById(id, function(err, user) {
        done(err, user);
    });
});


passport.use(new GoogleStrategy({
    clientID: client_id,
    clientSecret: client_secret,
    callbackURL: "http://localhost:3001/api/auth/google/callback",
  },
  function(accessToken, refreshToken, profile, done) {
    // User.findOne won't fire until we have all our data back from Google
    process.nextTick(function() {
        // try to find the user based on their google id
        User.findOne({ 'googleId' : profile.id }, function(err, user) {
            if (err){
              return done(err);
            }

            let authedUser;

            if (user) {
              // if a user is found, log them in
              authedUser = user;

            } else {
              // if the user isnt in our database, create a new user
              var newUser = new User();

              // set all of the relevant information
              newUser.googleId    = profile.id;
              newUser.googleToken = accessToken;
              newUser.googleName  = profile.displayName;
              newUser.googleEmail = profile.emails && profile.emails.length ? profile.emails[0].value : undefined; // pull the first email

              authedUser = newUser;
            }

            const token = authedUser ? authedUser.googleToken : '';

            isSubscribed(token, function(err, isSubbed) {
              authedUser.isSubscribed = isSubbed || false;
              authedUser.save(function(err, success) {
                if (err || !success) {
                  console.error('Unable to save user after isSubbed');
                }
                return done(null, authedUser);
              });
            });
        });
    });
  }
));

router.get('/', function(req, res) {
 res.json({ message: 'API Initialized!'});
});

// <!----------- API ROUTES ------------>
// comments
router.get('/comments', isLoggedIn, getComments);
router.post('/comments/comment', createComment);
router.delete('/comments/:commentId', deleteComment);
router.delete('/comments', removeAllComments);

// likes
router.post('/likes/:commentId', likeComment);
router.get('/likes', getLikes);
router.delete('/likes', removeAllLikes);

// users
router.get('/users', retrieveUsers);
router.delete('/users', deleteUsers);

// auth
router.get('/auth/google',
  passport.authenticate('google', { access_type: 'offline', approval_prompt: 'force', scope: ['https://www.googleapis.com/auth/plus.login', 'https://www.googleapis.com/auth/youtube', 'https://www.googleapis.com/auth/userinfo.profile'] }));

router.get('/auth/google/callback', 
  passport.authenticate('google', {
    successRedirect: 'http://localhost:3001/schapchat',
    failureRedirect: 'http://localhost:3001/error'
  }));

router.get('/logout', function(req, res) {
  req.logout();
  res.redirect('/login');
});

app.use('/api', router);

// <!--------View Routes --->
app.get('/schapchat', isLoggedIn, userSubscribed, function(req, res) {
  res.render('schapchat.ejs', {
      user : req.user // get the user out of session and pass to template
  });
});

app.get('/error', function(req, res) {
  res.render('error.ejs', {
  });
});

app.get('/login', function(req, res) {
  res.render('login.ejs', {
  });
});

// route middleware to make sure a user is logged in
function isLoggedIn(req, res, next) {
  // if user is authenticated in the session, carry on
  if (req.isAuthenticated()){
    console.log('user is authenticated', req.user)
    return next();
  }

  // if they aren't redirect them to the home page
  res.redirect('/login');
}

function userSubscribed(req, res, next) {
  console.log('current user ', req.user);
  if (req.user && req.user.isSubscribed) {
    next();
  }

  res.redirect('/subscribe');
}

app.listen(port, function() {
 console.log(`Prankin' on ${port}`);
});