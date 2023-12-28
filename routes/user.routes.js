const express = require('express');
const userController = require('../controllers/user.controller')
const router = express.Router();

router
    .route('/')
    .get(userController.getUsers);

router
    .route('/:id')
    .put(userController.updateUser);

router
    .route('/:id')
    .delete(userController.deleteUser);

router
    .route('/:id')
    .get(userController.getUser);

router
    .route('/:id/follow')
    .put(userController.followUser);

router
.route('/:id/unfollow')
.put(userController.unfollowUser);


module.exports = router;