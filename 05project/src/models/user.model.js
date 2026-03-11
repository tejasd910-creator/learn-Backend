import mongoose, { Schema } from 'mongoose'
import jwt from 'jsonwebtoken'
import bcrypt from 'bcrypt'

const userSchema = new Schema(
    {
        username: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
            index: true                // when searching is requied more use index field
        },
        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
        },
        fullName: {
            type: String,
            required: true,
            trim: true,
            index: true
        },
        avatar: {
            type: String,              // cloudinary url is used
            required: true,
        },
        coverImage: {
            type: String,              // cloudinary url is used
        },
        watchHistory: [
            {
                type: Schema.Types.ObjectId,
                ref: "Video"
            }
        ],
        password: {
            type: String,
            required: [true, "Password is required"]    // default message can also be given in all required
        },
        refreshToken: {
            type: String
        }
    },
    {
        timestamps: true

    }
)

userSchema.pre("save", async function () {                  // jab bi data save ho pahele function execute kar do. Here arrow function is not used because it don't have this. reference and here it is required. function takes time so use async
    if (!this.isModified("password")) return 

    this.password = await bcrypt.hash(this.password, 10)         // password process hon mai time lage ga so await
    
})

// designing custom methods
userSchema.methods.isPasswordCorrect = async function (password) {
    return await bcrypt.compare(password, this.password)          // entered password(must be string) and encrypted password is checked and return true/false
}

userSchema.methods.generateAccessToken = function () {
    return jwt.sign(
        {
            _id: this.id,
            email: this.email,
            username: this.username,
            fullname: this.fullName
        },
        process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn: ACCESS_TOKEN_EXPIRY
        }
    )
}
userSchema.methods.generateRefreshToken = function () {
    return jwt.sign(
        {
            _id: this.id,
        },
        process.env.REFRESH_TOKEN_SECRET,
        {
            expiresIn: REFRESH_TOKEN_EXPIRY
        }
    )
}

export const User = mongoose.model("User", userSchema);