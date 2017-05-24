// grab all comments 
function getComments(req, res) {
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
  if (false) {
    res.status(500);
    res.send({error: 'Unable to create comment'});
    return;
  }

  res.status(200);
  res.json({comment: {
    id: 0,
    userId: 0,
    body: ''
  }});
}

module.exports =  {
	getComments,
  createComment
}