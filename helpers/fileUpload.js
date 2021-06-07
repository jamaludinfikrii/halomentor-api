const multer = require('multer')
const storageOptions = multer.diskStorage({
  destination : (req,file,cb) => {
    cb(null, 'public/')
  },
  filename : (req,file,cb) => {
    cb(null, 'MENTOR-IMG-' + Date.now() + '.' + file.mimetype.split('/')[1])
  }
})


const upload = multer({storage : storageOptions})

module.exports = upload