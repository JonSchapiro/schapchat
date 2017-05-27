var mongoose = require('mongoose');
var Schema = mongoose.Schema;

mongoose.set('debug', true);

var CommentSchema = new Schema({
  author: String,
  text: String,
  likeCount: Number,
  authorId: String,
  date: Date,
  likes: [String]
});

module.exports = mongoose.model('Comment', CommentSchema);