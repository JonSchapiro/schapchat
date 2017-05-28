const {
  getComments,
  createComment,
  likeComment,
  getLikes,
  deleteComment,
  removeAllLikes,
  removeAllComments
} = require('../../controllers/commentsController');

module.exports = function(router) {
  router.get('/comments', getComments);
  router.post('/comments/comment', createComment);
  router.delete('/comments/:commentId', deleteComment);
  router.delete('/comments', removeAllComments);
  router.post('/likes/:commentId', likeComment);
	
  return router;
}