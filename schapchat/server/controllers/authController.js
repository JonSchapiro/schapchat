const {findUser, saveUser} = require('../services/db/user');
const {isSubscribed, renewAccessToken} = require('../services/youtube');
const User = require('../models/user');

function authenticateUser(accessToken, refreshToken, profile, done) {
  process.nextTick(function() {
      findUser({ 'googleId' : profile.id }, function(err, user) {
          if (err){
            return done(err);
          }

          let authedUser;

          if (user) {

            authedUser = user;

          } else {
            var newUser = new User();

            newUser.googleId    = profile.id;
            newUser.googleToken = accessToken;
            newUser.googleName  = profile.displayName;
            newUser.googleEmail = profile.emails && profile.emails.length ? profile.emails[0].value : '';
            newUser.googleRefreshToken = refreshToken;

            authedUser = newUser;
          }

          const token = authedUser ? authedUser.googleToken : '';

          // Can be better solved with async.whilst
          isSubscribed(token, function(err, isSubbed) {            
            // refresh token issue
            if (isSubbed.status === 401 && authedUser.googleRefreshToken) {
              return renewAccessToken(authedUser.googleRefreshToken, authedUser.googleToken, function (err, resp) {
                console.log('loc1 ', err);
                console.log('loc2 ', resp);
                if (!err && resp) {
                  authedUser.googleToken = resp.body.access_token;

                  return isSubscribed(authedUser.googleToken, function(err, sub) {
                    if (sub && sub.status === 200) {
                      authedUser.isSubscribed = sub.body;
                    }

                    saveUser(authedUser, function(err, success) {
                      done(null, authedUser);
                    });
                  });
                }

                return done(null, authedUser);
              });
            }

            // TODO: update subscription - service
            authedUser.isSubscribed = isSubbed.body || false;
            saveUser(authedUser, function(err, success) {
              if (err || !success) {
                console.error('Unable to save user after isSubbed');
              }

              return done(null, authedUser);
            });
          });
      });
  });
}

function renewAndRetry(cb) {

}

module.exports = {
	authenticateUser
}