import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js"
import { uploadCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";

//creating access and refresh token method (easy for code reusability)

const generateAccessAndRefreshTokens = async (userId) => {
    try {
        const user = await User.findOne(userId)             // get user data
        const accessToken = user.generateAccessToken()      // generate accessToken
        const refreshToken = user.generateRefreshToken()    // generate refreshToken

        user.refreshToken = refreshToken                    // adding refreshToken  to the user data
        await user.save({ validateBeforeSave: false })        // don't validate data before saving it in the database(I know what i'm doing and don't cause password issue)

        return { accessToken, refreshToken }                  // return both tokens

    } catch (error) {
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
    if (!username || !email) {
        throw new ApiError(400, "username or email is required")
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


export {
    registerUser,
    loginUser,
    logoutUser
}