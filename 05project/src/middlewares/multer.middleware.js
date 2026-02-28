import multer from 'multer'

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, './public/temp')
    },
    filename: function (req, file, cb) {
        // const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)          // this help to create filename as number
        // cb(null, file.fieldname + '-' + uniqueSuffix)
        cb(null, file.originalname)  // not a good practice
    }
})
// storage method return whole file name and path

export const upload = multer({
    storage
})