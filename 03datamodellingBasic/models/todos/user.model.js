import mongoose from 'mongoose'

const userSchema = new mongoose.Scheme(
    {
        username: {
            type: String,
            required: true,
            unique: true,
            lowercase: true
        },
        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true
        },
        password: {
            type: String,
            required: true
        }
    }, { timestamps: true }
);



export const User = mongoose.model("User", userSchema)           // Takes two parameter (kya model banao(name), kiske bases mai banao