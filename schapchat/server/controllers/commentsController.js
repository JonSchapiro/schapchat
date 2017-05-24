const _ = require('lodash');
const mongoose = require('mongoose');
const Comment = require('../models/comment');

function emptyComment(author, text, authorId) {
  return {
    author: author,
    text: text,
    likeCount: 0,
    authorId: authorId,
    date: new Date()
  };
}

// grab all comments 
function getComments(req, res, callback) {
  if (false) {
    res.status(500);
    res.send({error: 'Unable to retrieve comments'});
    return;
  }

  res.status(200);
  res.json({comments: []});
}

// create new comment
function createComment(req, res) {
  // grab username and id from session details
  // find or create comment with text from req
  const authorId = 1;
  const author = 'Jonathan Schapiro';
  const text = '';//'new comment';

  if (!authorId || !author || !text) {
    res.status(400);
    return res.json({Error: 'Not enough info to create a comment'});
  }

  const comment = new Comment();
  _.extend(comment, emptyComment(author, text, authorId));

  comment.save(function(err) {
    if (err) {
      res.status(500);
      return res.json({Error: 'Unable to save comment'});
    }

    res.status(200);
    res.json(comment);
  });
}

module.exports =  {
	getComments,
  createComment
}