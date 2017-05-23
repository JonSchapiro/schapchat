//first we import our dependencies…
const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');

const app = express();
const router = express.Router();
const port = process.env.API_PORT || 3001;

const {dbUser, dbPassword, dbUrl} = require('../config/database');
const {web} = require('../config/youtube');
const {client_id, project_id, auth_uri, token_uri, client_secret} = web;

const DB_CONNECTION_URL = `mongodb://${dbUser}:${dbPassword}${dbUrl}`;

const google = require('googleapis');

const OAuth2 = google.auth.OAuth2;

var oauth2Client = new OAuth2(
  client_id,
  client_secret,
  'localhost:3001/api/google/callback'
);

mongoose.connect(DB_CONNECTION_URL, (err) => {
	if (err) {
		return console.error(new Error('A problem occured while connecting to database!'));
	}
	console.log('Succesfully connected to database');
});

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

router.get('/', function(req, res) {
 res.json({ message: 'API Initialized!'});
});

app.use('/api', router);

app.listen(port, function() {
 console.log(`Prankin' on ${port}`);
});