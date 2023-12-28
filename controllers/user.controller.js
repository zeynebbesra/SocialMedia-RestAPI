const httpStatus = require('http-status')
const bcrypt = require('bcrypt')
const User = require('../models/User')
const ApiError = require('../responses/error/api-error')
const ApiDataSuccess = require('../responses/success/api-success')

const getUsers = async (req,res,next) => {
    res.send("hey this are our users!")
}

//update user
const updateUser = async (req, res, next) => {
    try {
        const userExist = await User.findById(req.params.id)
        if(!userExist){
            return next(
                new ApiError(
                    'User not found.',
                    httpStatus.NOT_FOUND
                )
            )
        }
        let newPassword

        if (req.body.password){
            const salt = await bcrypt.genSalt(10)
            newPassword = bcrypt.hashSync(req.body.password, salt)

            userExist.password = newPassword
            await userExist.save()

            return ApiDataSuccess.send("Password changed successfully!", httpStatus.CREATED, res, userExist)
        }
        
        const updatedUser = await User.findByIdAndUpdate(req.params.id, 
            {$set: req.body},
            {new: true}
        )
        return ApiDataSuccess.send("Account has been updated",httpStatus.OK, res, updatedUser)
        
    } catch (error) {
        return next(
            new ApiError(
                'Something went wrong :(',
                httpStatus.BAD_REQUEST,
                error.message
            )
        )
    }
    
}

//delete user
// const deleteUser = async (req, res, next) => {
//     try {
//         const userExist = await User.findById(req.params.id)
//         if(!userExist){
//             return next(
//                 new ApiError(
//                     'User not found.',
//                     httpStatus.NOT_FOUND
//                 )
//             )
//         }

//         if (userExist.isAdmin===true || req.session.authenticated){
//             const deletedUser = await User.findByIdAndDelete(req.params.id)
//             return ApiDataSuccess.send("Account has been deleted",httpStatus.OK, res, deletedUser)
//         }
//         console.log("SESSİON:",req.session)
//         console.log("SESSİON AUTH:",req.session.authenticated)
//         if (!req.session.authenticated){
//             return next(
//                 new ApiError(
//                     "You're not authenticated!",
//                     httpStatus.UNAUTHORIZED
//                 )
//             )
//         }

//     } catch (error) {
//         return next(
//             new ApiError(
//                 "Internal server error!",
//                 httpStatus.INTERNAL_SERVER_ERROR
//             )
//         )
        
//     }

// }



const deleteUser = async (req, res, next) => {
    // const userExist = await User.findById(req.params.id)
    //     if(!userExist){
    //         return next(
    //             new ApiError(
    //                 'User not found.',
    //                 httpStatus.NOT_FOUND
    //             )
    //         )
    //     }

    try {
        const userExist = await User.findById(req.params.id)
        if(!userExist){
            return next(
                new ApiError(
                    'User not found.',
                    httpStatus.NOT_FOUND
                )
            )
        }
        //kullanıcı login olduğunda ya da sadece admin silebilecek
        const deletedUser = await User.findByIdAndDelete(req.params.id)        
        return ApiDataSuccess.send("Account has been deleted", httpStatus.OK, res, deletedUser)
        
    } catch (error) {
        console.log("ERROR:",error)
        return next(
            new ApiError(
                'Internal server error!',
                httpStatus.INTERNAL_SERVER_ERROR
            )
        )
    }
}


//get a user
const getUser = async (req, res, next) => {
    const { id } = req.params;
    
    try {
        const user = await User.findById(id)
        
        if (!user){
            return next(
                new ApiError(
                    `There is no student with this id: ${id}`,
                    httpStatus.BAD_REQUEST
                )
            );
        }
        
        const {password, updatedAt,createdAt, ...other} = user._doc

        ApiDataSuccess.send(
            'User with given id found',
            httpStatus.OK,
            res,
            other
        )
        
    } catch (error) {
        return next(new ApiError(error.message, httpStatus.NOT_FOUND)); //db hatası vb.
    }

}


//follow user

const followUser = async (req, res, next) => {
    if (req.body.userId !== req.params.id) {
        try {
            const user = await User.findById(req.params.id)

            const currentUser = await User.findById(req.body.userId)

            if (!currentUser) {
                return next(new ApiError("Current user not found", httpStatus.NOT_FOUND));
            }
    
            if (!user.followers.includes(req.body.userId)){
                await user.updateOne({$push: {followers: req.body.userId}})
                await currentUser.updateOne({$push: {followings: req.params.id}})
                ApiDataSuccess.send(
                    `followed ${user.username}`,
                    httpStatus.OK,
                    res,
                    // user
                )
            } else {
                return next(new ApiError(error.message, httpStatus.FORBIDDEN));
            }
            
        } catch (error) {
            return next(new ApiError(error.message, httpStatus.NOT_FOUND));
        }
    } else{
        return next(new ApiError("You can't follow yourself", httpStatus.BAD_REQUEST));
    }
}


//unfollow user
const unfollowUser = async (req, res, next) => {
    if (req.body.userId !== req.params.id) {
        try {
            const user = await User.findById(req.params.id)
            const currentUser = await User.findById(req.body.userId)

            if (!currentUser) {
                return next(new ApiError("Current user not found", httpStatus.NOT_FOUND));
            }
    
            if (user.followers.includes(req.body.userId)){
                await user.updateOne({$pull: {followers: req.body.userId}})
                await currentUser.updateOne({$pull: {followings: req.params.id}})
                ApiDataSuccess.send(
                    `unfollowed ${user.username}`,
                    httpStatus.OK,
                    res,
                    // user
                )
            } else {
                return next(new ApiError(error.message, httpStatus.FORBIDDEN));
            }
            
        } catch (error) {
            return next(new ApiError(error.message, httpStatus.NOT_FOUND));
        }
    } else{
        return next(new ApiError("You can't unfollow yourself", httpStatus.BAD_REQUEST));
    }
}


module.exports = {
    getUsers,
    updateUser,
    deleteUser,
    getUser,
    followUser,
    unfollowUser
}