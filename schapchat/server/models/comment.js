var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var CommentSchema = new Schema({
  author: String,
  text: String,
  likeCount: Number,
  authorId: String,
  date: Date
});

module.exports = mongoose.model('Comment', CommentSchema);