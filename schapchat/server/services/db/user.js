const User = require('../../models/user');

function findUser(by, cb) {
  User.findOne(by, function(err, user) {
    if (err){
      return cb(err, null);
    }
    return cb(null, user);
  });
}

function saveUser(user, cb) {
  if (!user) {
    console.error('No user provided to save');
    return;
  }

  user.save(function(err, success) {
    return err ? cb(err, null) : cb(null, success);
  });
}

module.exports = {
  findUser,
  saveUser
}