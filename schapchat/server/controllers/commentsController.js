const _ = require('lodash');
const mongoose = require('mongoose');
const Comment = require('../models/comment');
const Like = require('../models/like');

function emptyComment(author, text, authorId) {
  return {
    author: author,
    text: text,
    likeCount: 0,
    authorId: authorId,
    date: new Date()
  };
}

function removeAllComments(req, res) {
  Comment.remove({}, function(err, resp) {
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
  Comment.findById(commentId)
    .exec(function(err, commentResp) {
      if (err) {
        res.status(500);
        return res.json({Error: 'Something went wrong in finding the comment'});
      }

      if (!commentResp || commentResp.authorId !== authorId) {
        res.status(400);
        return res.json({Error: 'User is not owner of this comment'});
      }

      Comment.remove({_id: commentId}, function(err) {
        if (err) {
          res.status(500);
          return res.json({Error: 'Unable to remove comment'});
        }

        Like.remove({commentId: commentId}, function(err, likeResp) {
          if (err) {
            res.status(500);
            return res.json({Error: 'Unable to remove like'});
          }

          res.status(200)
          return res.json(commentResp);
        });
      });
    });
}

// like a comment
function likeComment(req, res) {
  const commentId = req.params.commentId; // req.body.commentId;
  const userId = '1'; // req.session.userId;
  if (!commentId || !userId) {
    res.status(500);
    return res.json({Error: 'Unable to like comment'});
  }

  // check if like exists 
  Like.find({userId: userId})
    .where('commentId').equals(commentId)
    .exec(function(err, likeResp) {
      if (err) {
        res.status(500);
        return res.json({Error: 'Unable to lookup like'});
      }

      // if like not found found - create like and increment comment count
      if (!likeResp || likeResp && !likeResp.length) {
        const like = new Like();
        like.userId = userId;
        like.commentId = commentId;
        like.save(function(err) {
          if (err) {
            res.status(500);
            return res.json({Error: 'Unable to save like'});
          }


          // refactor - http://mongoosejs.com/docs/api.html#model_Model.update
          Comment.findById(commentId, function(err, comment) {
            if (err || !comment) {
              like.remove();
              res.status(500);
              return res.json({Error: 'Unable to find comment'});
            }

            comment.likeCount = comment.likeCount + 1;

            comment.save(function(err) {
              if (err) {
                res.status(500);
                return res.json({Error: 'Unable to update likeCount'});
              }

              res.status(200);
              res.json({LikesCount: comment.likeCount});
            });
          });
        });

        return;
      }

      // refactor - http://mongoosejs.com/docs/api.html#model_Model.update
      // decrement comment like count and delete like
      Comment.findById(commentId, function(err, comment) {
        if (err || !comment) {
          res.status(500);
          return res.json({Error: 'Unable to find comment'});
        }

        comment.likeCount = comment.likeCount - 1;

        comment.save(function(err) {
          if (err) {
            res.status(500);
            return res.json({Error: 'Unable to update likeCount'});
          }

          Like.remove({userId: userId, commentId: commentId}, function(err) {
            if (err) {
              res.status(500);
              return res.json({Error: 'Unable to delete like'});
            }
          });

          res.status(200);
          res.json({LikesCount: comment.likeCount});
        });
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
  Comment.find({}, function(err, comments) {
    if (err) {
      res.status(500);
      return res.json({Error: 'Error retreiving comments'});
    }

    res.status(200);
    res.json({comments: comments});
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
  createComment,
  likeComment,
  getLikes,
  deleteComment,
  removeAllLikes,
  removeAllComments
}