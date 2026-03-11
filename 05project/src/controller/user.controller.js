import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js"
import { uploadCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";


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
    //console.log(req.files);
    
    const avatarLocalPath = req.files?.avatar[0]?.path;         // give the local path of the file that exist in the system
    // const coverImageLocalPath = req.files?.coverImage[0]?.path;         // give the local path of the file that exist in the system

    let coverImageLocalPath;
    if(req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0){
        coverImageLocalPath = req.files.coverImage[0].path
    }

    if(!avatarLocalPath){
        throw new ApiError(400, "Avatar file is required")
    }

    //UPLOADING FILES TO CLOUDINARY

    const avatar = await uploadCloudinary(avatarLocalPath)           // upload hone mai time lage ga so await
    const coverImage = await uploadCloudinary(coverImageLocalPath)

    //CHECK IF UPLOADED SUCCESSFULLY

    if(!avatarLocalPath){
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

    if(!createdUser){
        throw new ApiError(500, "Something went wrong while registering a user")
    }

    //SENDING API RESPONSE

    return res.status(201).json(
        new ApiResponse(200, createdUser, "User registered successfully")
    )
})



export { registerUser }