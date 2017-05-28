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
const {isSubscribed, renewAccessToken} = require('./services/youtube');

const commentsRoutes = require('./middleware/routes/commentRoutes');
const userRoutes = require('./middleware/routes/userRoutes');

const {authenticateUser} = require('./controllers/authController');
const {getComments} = require('./controllers/commentsController');

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
app.use(express.static(__dirname + '/public'));

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
    authenticateUser(accessToken, refreshToken, profile, done);
  }
));

router.get('/', function(req, res) {
 res.json({ message: 'API Initialized!'});
});

// <!----------- API ROUTES ------------>
// comments/likes
commentsRoutes(router);

// users
userRoutes(router);

// auth
router.get('/auth/google',
  passport.authenticate('google', { accessType: 'offline', approvalPrompt: 'force', scope: ['https://www.googleapis.com/auth/plus.login', 'https://www.googleapis.com/auth/youtube', 'https://www.googleapis.com/auth/userinfo.profile'] }));

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
  getComments(null, null, function(err, comments) {
    if (err) {
      console.error('Error while retrieving comments: ', err);
    }

    res.render('schapchat.ejs', {
        user : req.user, // get the user out of session and pass to template
        comments: comments
    });
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
    return next();
  }

  // if they aren't redirect them to the home page
  res.redirect('/login');
}

function userSubscribed(req, res, next) {
  console.log('current user ', req.user);
  if (req.user && req.user.isSubscribed) {
    return next();
  }
  
  res.redirect('/subscribe');
}

app.listen(port, function() {
 console.log(`Prankin' on ${port}`);
});