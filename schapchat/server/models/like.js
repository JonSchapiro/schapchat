var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var LikeSchema = new Schema({
  userId: String,
  commentId: String,
});

module.exports = mongoose.model('Like', LikeSchema);