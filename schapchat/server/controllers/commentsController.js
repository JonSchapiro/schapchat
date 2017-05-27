const _ = require('lodash');
const mongoose = require('mongoose');
const Comment = require('../models/comment');
const Like = require('../models/like');
const {
  removeComments,
  findCommentWithAuthor,
  removeComment,
  getAllComments,
  saveComment,
  findComment
} = require('../services/db/comments');

function emptyComment(author, text, authorId) {
  return {
    author: author,
    text: text,
    likeCount: 0,
    likes: [],
    authorId: authorId,
    date: new Date()
  };
}

function removeAllComments(req, res) {
  removeComments(function(err, resp) {
    if (err) {
      res.status(500);
      return res.json({Error: 'Could not remove all comments'});
    }

    res.status(200);
    res.json({Success: 'All comments removed'});
  });
}

function removeAllLikes(req, res) {
  Like.remove({}, function(err, resp) {
    if (err) {
      res.status(500);
      return res.json({Error: 'Could not remove all likes'});
    }

    res.status(200);
    res.json({Success: 'All likes removed'});
  });
}

// delete a comment
function deleteComment(req, res) {
  const commentId = req.params.commentId;
  const authorId = '1'; // req.session.authorId;
  const errorMessage = '';

  if (!authorId) {
    errorMessage = 'Unable to identify user';
  }

  if (!commentId) {
    errorMessage = 'Unable to identify comment';
  }

  if (errorMessage) {
    res.status(400);
    return res.json({Error: 'Not enough information to delete comment'});
  }

  // Refactor - should all be done in one query
  findCommentWithAuthor(commentId, authorId, function(err, commentResp) {
      if (err) {
        res.status(500);
        return res.json(err);
      }

      if (!commentResp) {
        res.status(400);
        return res.json(err);
      }

      removeComment(commentId, function(err) {
        if (err) {
          res.status(500);
          return res.json(err);
        }

        res.status(200);
        return res.json(commentResp);
      });
    });
}

function likeComment(req, res) {
  const commentId = req.params.commentId;
  const userId = '1';//req.user ? req.user.googleId : '';
  if (!commentId || !userId) {
    res.status(500);
    return res.json({Error: 'Unable to like comment, must providea commentId and userId'});
  }

  findComment(commentId, function(err, comment) {
    if (err || !comment) {
      res.status(500);
      return res.json(err);
    }

    const deltaLike = comment.likes ? comment.likes.indexOf(userId) : -1;

    // like already exists
    if (deltaLike > -1) {
      comment.likes.splice(deltaLike, 1);
      comment.likeCount = comment.likeCount - 1;
    } else { // like doesn't exist yet
      comment.likes.push(userId);
      comment.likeCount = comment.likeCount + 1;
    }

    saveComment(comment, function(err) {
      if (err) {
        res.status(500);
        return res.json(err);
      }

      res.status(200);
      res.json({LikesCount: comment.likeCount});
    });
  });
}

// grab all likes 
function getLikes(req, res) {
  Like.find({}, function(err, likes) {
    if (err) {
      res.status(500);
      return res.json({Error: 'Error retreiving likes'});
    }

    res.status(200);
    res.json({likes: likes});
  });
}

// grab all comments 
function getComments(req, res) {
  getAllComments(function(err, comments) {
    if (err) {
      res.status(500);
      return res.json(err);
    }

    res.status(200);
    res.json(comments);
  });
}

// create new comment
function createComment(req, res) {
  const authorId = '1';
  const author = 'Jonathan Schapiro';
  const text = req.body.text;

  if (!authorId || !author || !text) {
    res.status(400);
    return res.json({Error: 'Not enough info to create a comment'});
  }

  const comment = new Comment();
  _.extend(comment, emptyComment(author, text, authorId));

  saveComment(comment, function(err) {
    if (err) {
      res.status(500);
      return res.json(err);
    }

    res.status(200);
    res.json(comment);
  });
}

module.exports =  {
	getComments,
  createComment,
  likeComment,
  getLikes,
  deleteComment,
  removeAllLikes,
  removeAllComments
}