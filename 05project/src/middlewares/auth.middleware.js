import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import jwt from "jsonwebtoken"
import { asyncHandler } from "../utils/asyncHandler.js";


export const verifyJWT = asyncHandler(async (req, _, next) => {           // when response is empty so insted of writing res can write _
    try {
        const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "")
        //In token store req.cookies.accessToken  or (for mobile custom header is sent mostly as Authorization as Authorization : Bearer <token>) replace "Bearer " with "" 

        if (!token) {
            throw new ApiError(401, "Unauthorized request")
        }

        // since token contains all the data so we have to decode it first
        const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET)

        const user = await User.findById(decodedToken._id).select("-password -refreshToken")

        if (!user) {
            //NEXT_VIDEO: Discuss about frontend
            throw new ApiError(401, "Invalid Access Token")
        }

        req.user = user
        next()
    } catch (error) {
        throw new ApiError(401, error?.message || "Invalid access Token")
    }

})