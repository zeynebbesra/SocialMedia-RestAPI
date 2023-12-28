const httpStatus = require('http-status')
const bcrypt = require('bcrypt')
const ApiError = require('../responses/error/api-error')
const ApiDataSuccess = require('../responses/success/api-success')
const User = require('../models/User')
const {createLoginToken} = require('../helpers/jwt.helper')

//Register
const register = async (req,res,next) => {
    try {
        //generate new password
        const salt = await bcrypt.genSalt(10)
        const hashedPassword = await bcrypt.hash(req.body.password, salt) 
        //create new user
        const newUser = new User({
            username:req.body.username,
            email: req.body.email,
            password: hashedPassword
        })
        const user = await newUser.save()
        ApiDataSuccess.send("Register succesfull!", httpStatus.CREATED, res, user)
    } catch (error) {
        return next(new ApiError(error.message, httpStatus.BAD_REQUEST))
    }
}

//Login
const login = async (req,res,next) => {
    try {
        const user = await User.findOne({email: req.body.email})
        if(!user){
            return next(
                new ApiError(
                    'Email or password is incorrect',
                    httpStatus.BAD_REQUEST
                )
            )
        }
        const validPassword = await bcrypt.compare(
            req.body.password,
            user.password
        )
        if(!validPassword){
            return next(
                new ApiError(
                    'Password is incorrect',
                    httpStatus.BAD_REQUEST
                )
            )
        }
        const accessToken = createLoginToken(user, res)
        ApiDataSuccess.send('Login succesfull', httpStatus.OK, res, accessToken)
        // console.log("LOGIN SESSION:",req.session)
    } catch (error) {
        return next(
            new ApiError(
                'Something went wrong :(',
                httpStatus.INTERNAL_SERVER_ERROR,
                error.message
            )
        )
        
    }
}

module.exports = {
    register,
    login
}