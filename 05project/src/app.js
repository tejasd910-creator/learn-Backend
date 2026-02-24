import express from 'express'
import cors from 'cors'
import cookieParser from 'cookie-parser'

const app = express()

app.use(cors({
    origin: process.env.CORS_ORGIN,
    credentials:true
}))

app.use(express.jason({limit : "16kb"}))    // limit on jason data max 16kb only
app.use(express.urlencoded({extended: true, limit : "16kb"}))        // help in maintaing url structure extended is not necessary and limit is as pre req
app.use(express.static("public"))         // here public is just a name of folder where you want to store data used everywhere like image or file
app.use(cookieParser())        // to store cookies in browser by server (secure cookies are installed and delete by server only)



export { app }