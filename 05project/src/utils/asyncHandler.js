// Method 1 (short but advance js)
const asyncHandler = (requestHandler) => {
    return (req, res, next) => {
        Promise.resolve(requestHandler(req, res, next)).catch((err) => next(err)) // Promise is like a
        //Promise is a built-in JavaScript object that represents a value that may complete:
        //if success then reslove requestHandler as promise
        //if fail then Catches the error & Passes it to Express error middleware
    
    }
}



export {asyncHandler}





// const asyncHandler = () => {}                     //ek method create kiya
// const asyncHandler = (func) => {() => {}}         // using higher order function(function using function as a parameter)
// const asyncHandler = (func) => () => {}           // curvey barces can be removed
// const asyncHandler = (func) => async () => {}     // function ko async kar diya


// Method 2 (simple but bit lengthy)
// const asyncHandler = (func) => async (req, res, next) => {
//     try {
//         await func(req, res, next)
//     } catch (error) {
//         res.status(err.code || 500).json({
//             success: false,
//             message: err.message
//         })
//     }
// }
