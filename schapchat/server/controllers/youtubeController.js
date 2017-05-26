
const isSubscribed = require('../services/youtube');
const subCache = false;

function userSubscribed(req, res, next) {
  if (subCache) {
    return next();
  }

  isSubscribed(function (err, isSubbed) {
    if (err) {
      console.log('An error occurred while trying to check sub');
      return res.redirect('/login');
    }

    subCache = isSubbed;

    if (subCache) {
      return next();
    }

    res.redirect('/login');
  });
}

module.exports = {
  userSubscribed
};