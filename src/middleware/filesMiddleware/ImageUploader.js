const UploaderManager = require('./UploaderManager');


class ImageUploader extends UploaderManager{
  constructor(filepath){
    super(filepath);
  }
  filter(req, file, cb){
    // Accept images only
    if (!file.originalname.match(/\.(jpg|JPG|jpeg|JPEG|png|PNG|gif|GIF)$/)) {
      req.fileValidationError = 'Only image files are allowed!';
      return cb(new Error('Only image files are allowed!'), false);
    }
    cb(null, true);
  }
}

module.exports  = ImageUploader;