import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js"
import { uploadCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import jwt from "jsonwebtoken"
import mongoose from "mongoose";

//creating access and refresh token method (easy for code reusability)

const generateAccessAndRefreshTokens = async (userId) => {
    try {
        const user = await User.findById(userId)             // get user data
        if (!user) {
            throw new ApiError(404, "User not found")
        }
        const accessToken = user.generateAccessToken()      // generate accessToken
        const refreshToken = user.generateRefreshToken()    // generate refreshToken

        user.refreshToken = refreshToken                    // adding refreshToken  to the user data
        await user.save({ validateBeforeSave: false })        // don't validate data before saving it in the database(I know what i'm doing and don't cause password issue)

        return { accessToken, refreshToken }                  // return both tokens

    } catch (error) {
        console.error("TOKEN ERROR:", error)   // 👈 THIS LINE WILL REVEAL TRUTH
        throw new ApiError(500, "Somethig went wrong while generating access and refresh tokens")
    }
}


//REGISTER USER
const registerUser = asyncHandler(async (req, res) => {
    //get user details from frontEnd
    //validation - not empty input
    //check if user already exist - (email/username)
    //check from image and avatar
    //upload them in cloudinary
    //create user object - create entry in db
    //remove password and refresh token field from resopnse
    //check for user creation 
    //return response

    const { fullName, email, username, password } = req.body
    // console.log("email :", email);

    //CHECK INVAILD ENTRY

    //Basic method for error handelling
    // if(fullName == ""){
    //     throw new ApiError(404 , "fullName is required")
    // }

    //Better Method
    if (
        [fullName, email, username, password].some((field) =>
            field?.trim() === "")
    ) {
        throw new ApiError(404, "All fields are required")
    }


    //CHECK USER EXISTS OR NOT

    const existedUser = await User.findOne({         //findOne method return the first user with matcing data
        $or: [{ username }, { email }]        //$or is an operator that check for the given fields entered in the array
    })

    if (existedUser) {
        throw new ApiError(409, "User with email or username  already exists")
    }

    //CHECK FOR AVATAR AND IMAGE

    // req.body  method by express give access to content of file(default)

    //multer give req.files access to access files (? == if exist)
    // console.log(req.files);

    const avatarLocalPath = req.files?.avatar[0]?.path;         // give the local path of the file that exist in the system
    // const coverImageLocalPath = req.files?.coverImage[0]?.path;         // give the local path of the file that exist in the system

    let coverImageLocalPath;
    if (req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0) {
        coverImageLocalPath = req.files.coverImage[0].path
    }

    if (!avatarLocalPath) {
        throw new ApiError(400, "Avatar file is required")
    }

    //UPLOADING FILES TO CLOUDINARY

    const avatar = await uploadCloudinary(avatarLocalPath)           // upload hone mai time lage ga so await
    const coverImage = await uploadCloudinary(coverImageLocalPath)
    // console.log(avatar);


    //CHECK IF UPLOADED SUCCESSFULLY

    if (!avatarLocalPath) {
        throw new ApiError(400, "Avatar file is required")
    }

    //CREATING USER

    const user = await User.create({                         // User have create method by default to create a user
        fullName,
        avatar: avatar.url,
        coverImage: coverImage?.url || "",
        email,
        password,
        username: username.toLowerCase()
    })

    // CHECK IF CREATED SUCCESSFULLY

    const createdUser = await User.findById(user._id).select(      //MongoDb create a unique userId for each user by default anf to check for that id use findById method
        "-password -refreshToken"           // select method help to decide which field need not to be check for user checking "-" indicate this field neednot ti be checked
    )

    if (!createdUser) {
        throw new ApiError(500, "Something went wrong while registering a user")
    }

    //SENDING API RESPONSE

    return res.status(201).json(
        new ApiResponse(200, createdUser, "User registered successfully")
    )
})

//LOGIN USER
const loginUser = asyncHandler(async (req, res) => {
    // take data from req.body 
    // username or email (how to login user)
    // find the user
    // password check
    // generate access and referesh token
    // send tem through cookie

    //GETTING DATA
    const { email, username, password } = req.body

    //CHECKING FOR REQUIRED INPUT
    if (!(username || email)) {      // both are required
        throw new ApiError(400, "username and email is required")
    }

    //FINDING USER IN DATABASE
    const user = await User.findOne({
        $or: [{ username }, { email }]
    })

    //ERROR IF NOT EXIST
    if (!user) {
        throw new ApiError(404, "User doesn't exist")
    }

    //PASSWORD CHECK
    const isPasswordValid = await user.isPasswordCorrect(password)

    if (!isPasswordValid) {
        throw new ApiError(401, "Invalid User credentials")
    }

    //TOKEN GENERATION
    const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(user._id)

    //since above user don't have any token right now so again call database
    const loggedInUser = await User.findById(user._id).select("-password -refreshToken")

    const options = {                 //an Object used to set some restriction
        httpOnly: true,               // By default any one can access and modified cookies but after httpOnly and secure is true only server can modified cookies
        secure: true
    }

    //COOKIE RESPONSE

    return res
        .status(200)
        .cookie("accessToken", accessToken, options)           // method to directly send cookie(key, value, options)
        .cookie("refreshToken", refreshToken, options)
        .json(                                                 // json response
            new ApiResponse(                                   // response api
                200,                                           // status code
                {
                    user: loggedInUser, accessToken, refreshToken                 // data if frontEnd want to access tokens
                },
                "User logged in Successfully"                  // message
            )
        )
})

//LOGOUT USER (we are not able to logout user so we created a middleware to do so)
const logoutUser = asyncHandler(async (req, res) => {
    //with the help of verifyJWT middleware now we have user detaild in the req 
    User.findByIdAndUpdate(                    // method to find and update database
        req.user._id,                          // find _id from user in req
        {
            $set: {                            // operator to update value in the database
                refreshToken: undefined        // delete refreshToken
            }
        },
        {
            new: true                          // return new updated value of user after deleting refreshToken
        }
    )
    //delete refreshToken and accessToken 

    const options = {                 //an Object used to set some restriction
        httpOnly: true,               // By default any one can access and modified cookies but after httpOnly and secure is true only server can modified cookies
        secure: true
    }

    //COOKIE RESPONSE

    return res
        .status(200)
        .clearCookie("accessToken", options)           // method to directly send cookie(key, value, options)
        .clearCookie("refreshToken", options)
        .json(new ApiResponse(200, {}, "User logged Out"))
})

//Creating endpoint for refreshAccessToken

const refreshAccessToken = asyncHandler(async (req, res) => {
    const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken       // req.cookies for pc and eq.body for mobile

    //if no refresh token
    if (!incomingRefreshToken) {
        throw new ApiError(401, "unauthorized request")
    }

    //if present
    try {
        const decodedToken = jwt.verify(incomingRefreshToken, process.env.REFRESH_TOKEN_SECRET)

        const user = await User.findById(decodedToken?._id)

        if (!user) {
            throw new ApiError(401, "Invalid Refresh Token")
        }

        if (incomingRefreshToken !== user?.refreshToken) {
            throw new ApiError(401, "Refresh token is expired or used")
        }

        const options = {
            httpOnly: true,
            secure: true
        }

        const { accessToken, newRefreshToken } = await generateAccessAndRefreshTokens(user._id)

        return res
            .status(200)
            .cookies("accessToken", accessToken, options)
            .cookies("refreshToken", refreshToken, options)
            .json(
                new ApiResponse(
                    200,
                    { accessToken, refreshToken: newRefreshToken },
                    "Access token refreshed"
                )
            )
    } catch (error) {
        throw new ApiError(401, error?.message || "Invalid Refresh Token")
    }
})

const changeCurrentPassword = asyncHandler(async (req, res) => {
    const { oldPassword, newPassword } = req.body

    const user = await User.findById(req.user?._id)
    const isPasswordCorrect = await user.isPasswordCorrect(oldPassword)

    if (!isPasswordCorrect) {
        throw new ApiError(400, "Incorrect Password")
    }

    user.password = newPassword
    await user.save({ validateBeforeSave: false })

    return res
        .status(200)
        .json(new ApiResponse(200, {}, "Password changed successfully"))
})

const getCurrentUser = asyncHandler(async (req, res) => {
    return res
        .status(200)
        .json(new ApiResponse(
            200,
            req.user,
            "current user fetched successfully"
        ))
})

const updateAccountDetails = asyncHandler(async (req, res) => {
    const { fullName, email } = req.body                  // better to write seperate part for file and if want to change picture only give here

    if (!fullName || !email) {
        throw new ApiError(400, "All fields are required")
    }

    const user = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set: {
                fullName,
                email
            }
        },
        { new: true }

    ).select("-password")

    return res
        .status(200)
        .json(new ApiResponse(200, user, "Account details updated successfully"))
})

const updateUserAvatar = asyncHandler(async (req, res) => {
    const avatarLocalPath = req.file?.path         // file not files since only required avatar file not coverImage

    if (!avatarLocalPath) {
        throw new ApiError(400, "Avatar file is missing")
    }

    // TODO to delete older avatar files local paths
    const avatar = await uploadCloudinary(avatarLocalPath)

    if (!avatar.url) {
        throw new ApiError(400, "Error while uploading on avatar")
    }

    const user = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set: {
                avatar: avatar.url
            }
        },
        { new: true }
    ).select("-password")

    return res
        .status(200)
        , json(
            new ApiResponse(200, user, "Avatar is updated successfully")
        )
})

const updateUserCoverImage = asyncHandler(async (req, res) => {
    const coverImageLocalPath = req.file?.path         // file not files since only required avatar file not coverImage

    if (!coverImageLocalPath) {
        throw new ApiError(400, "CoverImage file is missing")
    }

    const coverImage = await uploadCloudinary(coverImageLocalPath)

    if (!coverImage.url) {
        throw new ApiError(400, "Error while uploading on CoverImage")
    }

    const user = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set: {
                coverImage: coverImage.url
            }
        },
        { new: true }
    ).select("-password")

    return res
        .status(200)
        , json(
            new ApiResponse(200, user, "Cover Image is updated successfully")
        )
})

const getUserChannelProfile = asyncHandler(async (req, res) => {
    const { username } = req.params

    if (!username?.trim()) {
        throw new ApiError(400, "username is missing")
    }

    const channel = await User.aggregate([                  //aggregate is a pipelining method that takes an array of multiple pipelining fields
        {
            $match: {                                       //$match is a pipelining field use to match the required property in the db
                username: username?.toLowerCase()
            }
        },
        {   //To find the number of subscribers, find how many owner have channel name saved as owner name
            $lookup: {
                from: "subscriptions", // from where to look data (from Subscription model but by default the name is saved as lowercase plural)
                localField: "_id",     // what local field you want to check in the foreign data
                foreignField: "channel",  // how that field is saved in the foreign data 
                as: "subscribers"   // how you want that data to be return as
            }
        },
        {   //To find the number to channel owner had subscrided find how many subscriber name save as owner name in the db
            $lookup: {
                from: "subscriptions", // from where to look data (from Subscription model but by default the name is saved as lowercase plural)
                localField: "_id",     // what local field you want to check in the foreign data
                foreignField: "subscriber",  // how that field is saved in the foreign data 
                as: "subscribedTo"   // how you want that data to be return as
            }
        },
        {
            $addFields: {             // keep the above data as usual but also add the specified filed in the output
                subscribersCount: {
                    $size: "$subscribers"       // add all the number of subscribers(now it is a field so use $)
                },
                channelSubscribedToCount: {
                    $size: "$subscribedTo"     // add all the number of channel subscribed
                },
                isSubscribed: {
                    $cond: {               // give true or false(have three parameter if(condition) then(if true) else(if false))
                        if: {$in: [req.user?._id, "$subscribers.subscriber"]},                //$in operator to check presence(both in array and object) (subscribers field ke aander subscriber)
                        then: true,
                        else: false
                    }
                }
            }
        },
        {
            $project: {            // what all data need to be send to frontEnd
                fullName: 1,
                username: 1,
                subscribersCount: 1,
                channelSubscribedToCount: 1,
                isSubscribed: 1,
                avatar: 1,
                coverImage: 1,
                email: 1
            }
        }
    ])

    if(!channel?.length) {
        throw new ApiError(404, "channel does not exists")
    }

    return res
    .status(200)
    .json(
        new ApiResponse(200, channel[0], "User channel fetched successfully")
    )
})

const getWatchedHistory = asyncHandler(async(req, res) => {
    //req.user._id: actually give a string which mongoose automatically convert to mongodb id in everydb call
    //inside pipelines al data go directly so we need to convert sring into monngodb id using mongoose method

    const user = await User.aggregate([
        {
            $match: {                 // always first field
                _id: new mongoose.Types.ObjectId(req.user._id)   //give access to user model
            }
        },
        {
            $lookup: {//look inside user
                from: "videos",                 //videos ke aander lookup
                localField: "watchHistory",     // current user ke watchhistory ka data
                foreignField: "_id",            //videos ki id se match karo
                as: "watchHistory",             // return as watchHistory
                pipeline: [                 //This pipeline give access to videos model 
                    {
                        $lookup: {//look inside video
                            from: "user",
                            localField: "owner",
                            foreignField: "_id",
                            as: "owner",
                            pipeline: [
                                {
                                    $project: { //directly return data here instead of doing external
                                        fullName: 1,
                                        username: 1,
                                        avatar: 1
                                    }
                                }
                            ]
                        }
                    },
                    {
                        $addFields: { //this further pipeline help frontend to access id easily by directly returning the id
                            owner: {
                                $first: "$owner"   //$first directly give the first element of the owner array
                            }
                        }
                    }
                ]
            }
        }
    ])

    return res
    .status(200)
    .json(
        new ApiResponse(
            200,
            user[0].watchHistory,         // $lookup always return data in array so even if the user is unique the data still wrapped it in array
                                          // look like user = [{single user}] so to access that user we write user[0]
            "Watch history fetched successfully"
        )
    )
})

export {
    registerUser,
    loginUser,
    logoutUser,
    refreshAccessToken,
    changeCurrentPassword,
    getCurrentUser,
    updateAccountDetails,
    updateUserAvatar,
    updateUserCoverImage,
    getUserChannelProfile,
    getWatchedHistory
}