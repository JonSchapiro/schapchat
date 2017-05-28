const {retrieveUsers, deleteUsers} = require('../../controllers/userController');
module.exports = function (router){
  router.get('/users', retrieveUsers);
  router.delete('/users', deleteUsers);
  return router;
}