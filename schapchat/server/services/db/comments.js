const _ = require('lodash');
const mongoose = require('mongoose');
const Comment = require('../../models/comment');
const Like = require('../../models/like');

function removeComments(cb) {
  Comment.remove({}, function(err, resp) {
    if (err) {
      return cb(err, null);
    }

    cb(null , resp);
  });
}

function findCommentWithAuthor(commentId, authorId, cb) {
  Comment.findById(commentId)
    .exec(function(err, commentResp) {
      if (err) {
        return cb({Error: 'Something went wrong in finding the comment'}, null);
      }

      if (!commentResp) {
        return cb({Error: 'Comment does not exist'}, null);
      }

      if (commentResp.authorId !== authorId) {
        return cb({Error: 'User is not owner of this comment'}, null);
      }

      return cb(null, commentResp);
    });
}

function removeComment(commentId, cb) {
  Comment.remove({_id: commentId}, function(err) {
    if (err) {
      return cb({Error: 'Unable to remove comment'}, null);
    }

    return cb(null, {Success: 'Comment removed'});
  });
}

function saveComment(comment, cb) {
  if (!comment) {
    return cb({Error: 'No comment provided to save'});
  }

  comment.save(function(err) {
    if (err) {
      return cb({Error: 'Unable to save comment'});
    }

    cb(null, comment)
  });
}

function findComment(commentId, cb) {
  Comment.findById(commentId, function(err, comment) {
    if (err || !comment) {
      return cb({Error: 'Unable to find comment'});
    }

    return cb(null, comment);
  });
}

function getAllComments(cb) {
  Comment.find({}, function(err, comments) {
    if (err) {
      return cb({Error: 'Error retreiving comments'});
    }

    cb(null, {comments: comments});
  });
}

module.exports = {
  removeComments,
  findCommentWithAuthor,
  removeComment,
  getAllComments,
  saveComment,
  findComment
}