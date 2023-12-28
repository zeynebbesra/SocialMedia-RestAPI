const express = require('express');
const postController = require('../controllers/post.controller')
const router = express.Router();

router 
    .route('/')
    // .get(postController)

router
    .route('/')
    .post(postController.createPost)


router
    .route('/:id')
    .put(postController.updatePost)

router
    .route('/:id')
    .delete(postController.deletePost)

router
    .route('/:id/like')
    .put(postController.likepost)

router
    .route('/:id')
    .get(postController.getpost)

router
    .route('/timeline/all')
    .get(postController.getTimeLinePosts)


module.exports = router