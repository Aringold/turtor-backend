import path from 'path';
const multer = require('multer');
const { uuid } = require('uuidv4');

module.exports = (root) => {
  var storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, root)
    },
    filename: function (req, file, cb) {
      cb(null, file.fieldname + '-' + uuid() + '-' + Date.now() + path.extname(file.originalname));
    }
  })
   
  var Uploader = multer({ storage: storage });
  return Uploader
}