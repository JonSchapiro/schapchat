(function() {

  const commentsMap = {};

	function pollForComments() {
    $.ajax({
      url: "/api/comments",
      type: "get",
      success: function (result) {
          //SUCCESS LOGIC
          console.log('we did it', result)
      },
      error: function (err) {
          //ERROR HANDLING
          console.log('we didnt do it', err)
      }});
  }
  pollForComments();
}());


function likeComment(e) {
  var $this = $(this);
  var $comment = $this.parent();
  var likeCount = $comment.children()[2]
  var commentId = $comment.attr('data-comment-id');
  var likeStatus = parseInt($this.attr('data-like-status'));

  if (!commentId) {
    return;
  }

  if (!likeStatus) {
    likeStatus = likeStatus + 1;
    likeCount++;
  } else {
    likeStatus = likeStatus - 1;
    likeCount--;
  }

  
}
