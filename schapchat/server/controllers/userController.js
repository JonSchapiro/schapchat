const _ = require('lodash');
const mongoose = require('mongoose');
const User = require('../models/user');

function retrieveUsers(req, res) {
  User.find({}, function(err, users) {
    if (err) {
      res.status(500);
      return res.json({Error: 'Error retreiving users'});
    }
    res.status(200);
    res.json({users: users});
  });
}

function deleteUsers(req, res) {
  User.remove({}, function(err, users) {
    if (err) {
      res.status(500);
      return res.json({Error: 'Unable to delete all users'});
    }

    res.status(200);
    res.json({Success: users});
  });
}

module.exports = {
  retrieveUsers,
  deleteUsers
};