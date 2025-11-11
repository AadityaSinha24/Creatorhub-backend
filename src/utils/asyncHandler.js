// this handler will just export the method using next flag to middlewares

const asyncHandler = (requestHandler) => {
    return (req,res,next) => {
        Promise.resolve(requestHandler(req,res,next)).catch((err) => next(err))
    }
}


export {asyncHandler}


// const asyncHandler = () => {} these are just steps to understand higher order function
// const asyncHandler = (func) => {() => {}} step2
// const asyncHandler = (func) =>  { async () => {}} === const asyncHandler = (fn) => async () => {} step3

// const asyncHandler = (fn) => async (req,res,next) => {
//     try {
        
//     } catch (error) {
//         res.status(error.code || 500 ).json({
//             sucess: false,
//             message: error.message
//         })   
        
//     }
// }