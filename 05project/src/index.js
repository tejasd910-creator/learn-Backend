// require('dotenv').config({path: './env'})    code look is not same as import
import dotenv from 'dotenv'
import connectDB from './db/index.js';

dotenv.config({
    path: './env'
})


connectDB()
.then(() => {                    // when connection is successful
    app.on("error", (error) => {
        console.log("ERROR", error);
        throw error
    })
    app.listen(process.env.PORT || 8000, () => {
        console.log(`Server is running at port : ${process.env.PORT}`);
    })
})                       
.catch((err) => {
    console.log("MONGO db connection failed !!! ", err);        // when connection failed
})













/*
import express from 'express'
const app = express();
// function connectingDB(){}
// connectingDB();

//  OR use IFFE
; (async () => {
    try {
        await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`)
        app.on("error", (error) => {
            console.log("ERROR", error);
            throw error
        })

        app.listen(process.env.PORT, () => {
            console.log(`App is listening on port ${process.env.PORT}`);
        })
    } catch (error) {
        console.error('ERROR:', error);
        throw err
    }
})()

*/