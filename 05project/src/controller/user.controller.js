import { asyncHandler } from "../utils/asyncHandler.js";


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

    const {fullNme, email, username, password}= req.body
    console.log("email :", email);
    
})



export { registerUser }