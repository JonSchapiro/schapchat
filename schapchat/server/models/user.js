var mongoose = require('mongoose');
var Schema = mongoose.Schema;

mongoose.set('debug', true);

var UserSchema = new Schema({
  googleId: String,
  googleToken: String,
  googleName: String,
  googleEmail: String,
  isSubscribed: Boolean,
  googleRefreshToken: String
});

module.exports = mongoose.model('User', UserSchema);