import { Router } from "express"
import { loginUser, logoutUser, refreshAccessToken, registerUser } from "../controller/user.controller.js"
import { upload } from "../middlewares/multer.middleware.js"
import { verifyJWT } from "../middlewares/auth.middleware.js"

const userRouter = Router()

userRouter.route("/register").post(
    upload.fields([
        {
            name: "avatar",
            maxCount: 1
        },
        {
            name: "coverImage",
            maxCount: 1
        }
    ]),
    registerUser
)

userRouter.route("/login").post(loginUser)

//secured routes
userRouter.route("/logout").post(verifyJWT, logoutUser)            //verifyJWT is s middleware so i.e why next() is used in yhe middleware to tell the next step(first verifyJWt then logoutUser)
userRouter.route("/refresh-token").post(refreshAccessToken)        // verify wala kaam usercontroller mai he kar diya so verifyJWT wala middleware is not use

export default userRouter