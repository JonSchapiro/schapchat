var mongoose = require('mongoose');
var Schema = mongoose.Schema;

mongoose.set('debug', true);

var LikeSchema = new Schema({
  userId: String,
  commentId: String,
});

module.exports = mongoose.model('Like', LikeSchema);