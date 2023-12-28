const PORT = process.env.PORT ?? 8800
const express = require("express")
const session = require('express-session');
const cookieParser = require('cookie-parser');
const app = express()
const connection = require('./utils/db-connection')
const errorHandler = require("./middlewares/error-handler.middleware")
const dotenv = require("dotenv")
const helmet = require("helmet")
const morgan = require("morgan")

dotenv.config()

app.use(cookieParser())
app.use(
    session({
        secret: "alivezeynep", //this is useful for encrypting and decrypting the cookie
        resave: false,
        saveUninitialized: false,
    })
)

//middleware
app.use(express.json()) //when we make post request it's gonna parse it.
app.use(helmet())
app.use(morgan("common"))
app.use(errorHandler)


app.get("/", (req,res)=>{
    res.send("welcome!")
})

//Routers
const userRouter = require('./routes/user.routes')
const postRouter = require('./routes/post.routes')
const authRouter = require('./routes/auth.routes')

const api = process.env.API_URL
 
app.use(`${api}/users`, userRouter)
app.use(`${api}/auth`, authRouter)
app.use(`${api}/posts`, postRouter)

//db connection
connection()



app.listen(PORT, ()=>{
    console.log("Backend server is running!")
})