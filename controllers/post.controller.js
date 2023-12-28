const httpStatus = require('http-status')
const Post = require('../models/Post')
const ApiError = require('../responses/error/api-error')
const ApiDataSuccess = require('../responses/success/api-success')
const { post } = require('../routes/user.routes')
const User = require('../models/User')

//create a post

const createPost =  async(req,res,next)=>{
    const newPost = new Post(req.body)
    try {
        const savedPost = await newPost.save()
        ApiDataSuccess.send(
            "Post created",
            httpStatus.OK,
            res,
            savedPost
        )
    } catch (error) {
        return next(new ApiError(error.message, httpStatus.INTERNAL_SERVER_ERROR))
        
    }
}

const updatePost = async(req, res, next) => {
    try {
        const updatedPost = await Post.findById(req.params.id)
        if(!updatedPost){
            return next(
                new ApiError(
                    'Post not found.',
                    httpStatus.NOT_FOUND
                )
            )
        }
        if (updatedPost.userId === req.body.userId){
            await updatedPost.updateOne({ $set: req.body})
            ApiDataSuccess.send(
                "Post updated",
                httpStatus.OK,
                res,
                updatedPost //?
            )
        
        }else {
            return next(
                new ApiError(
                    'You can update only your posts!',
                    httpStatus.FORBIDDEN
                )
            )
        }
    } catch (error) {
        return next(
            new ApiError(
                '',
                httpStatus.BAD_REQUEST
            )
        )
    }
}

//delete a post
const deletePost = async (req, res, next) => {
    try {
        const post = await Post.findById(req.params.id)
        if(!post){
            return next(
                new ApiError(
                    'Post not found.',
                    httpStatus.NOT_FOUND
                )
            )
        }
        if (post.userId === req.body.userId){
            await post.deleteOne()
            ApiDataSuccess.send(
                "Post deleted",
                httpStatus.OK,
                res,
                post//?
            )
        
        }else {
            return next(
                new ApiError(
                    'You can delete only your posts!',
                    httpStatus.FORBIDDEN
                )
            )
        }
    } catch (error) {
        return next(
            new ApiError(
                'Something went wrong',
                httpStatus.BAD_REQUEST
            )
        )
    }
} 

// like/dislike a post

const likepost = async (req, res, next) => {
    try {
        const post = await Post.findById(req.params.id)
        if (!post.likes.includes(req.body.userId)){
            await post.updateOne({ $push: {likes: req.body.userId}})
            ApiDataSuccess.send(
                "Post liked",
                httpStatus.OK,
                res,
                // post
            )
        }else{
            await post.updateOne({$pull:{likes: req.body.userId}})
            ApiDataSuccess.send(
                "Post disliked",
                httpStatus.OK,
                res,
                // post
            )
        }
        
    } catch (error) {
        return next(
            new ApiError(
                'Something went wrong',
                httpStatus.BAD_REQUEST,
                console.log(error)
            )
        )
    }
}

const getpost = async (req, res, next) => {
    try {
        const post = await Post.findById(req.params.id)
        ApiDataSuccess.send(
            "Post with given id found",
            httpStatus.OK,
            res,
            post
        )
    } catch (error) {
        return next(
            new ApiError(
                'Something went wrong',
                httpStatus.BAD_REQUEST,
                console.log(error)
            )
        )
        
    }
}

// get timeline posts

const getTimeLinePosts = async (req, res, next) =>{
    try {
        const currentUser = await User.findById(req.body.userId)
        const userPosts = await Post.find({ userId: currentUser._id})
        const friendPosts = await Promise.all(
            currentUser.followings.map((friendId)=> {
                return Post.find({ userId: friendId })
            })
        )
        ApiDataSuccess.send(
            "Timeline Posts",
            httpStatus.OK,
            res,
            userPosts.concat(...friendPosts)
        )
        
    } catch (error) {
        return next(
            new ApiError(
                'Something went wrong',
                httpStatus.BAD_REQUEST,
                console.log(error)
            )
        )
    }
}

module.exports = {
    createPost,
    updatePost,
    deletePost,
    likepost,
    getpost,
    getTimeLinePosts
}