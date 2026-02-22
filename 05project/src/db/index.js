import mongoose from 'mongoose'
import { DB_NAME } from '../constants.js';

const connectDB = async () => {
    try{
        const connectionInstance = await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`)    // mongoose return an object which can be stored in a variable
        console.log(`\n MongoDB connected !! DB HOST: ${connectionInstance.connection.host}`);   // give the whole url of the host just to know the correct host is connected
        
    }catch(error){
        console.log("MONGODB connection Error", error);
        process.exit(1)    // node js method to exit a process
    }
}

export default connectDB;