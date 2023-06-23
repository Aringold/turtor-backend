const UploaderManager = require('./UploaderManager');

class VideoUploader extends UploaderManager{
  constructor(filepath){
    super(filepath);
  }

  filter(req, file, cb){
    // Accept images only
    if (!file.originalname.match(/\.(mp4|mp4|m4a|m4v|f4v|f4a|m4b|m4r|f4b|mov|3gp|3gp|3gp2|3g2|3gpp|3gpp2|ogg|ogg|oga|ogv|ogx|wmv|wmv|wma|asf*|webm|webm|flv|flv|avi*|quicktime*|hdv*mxf|op1a|op-atom|*mpeg-ts|ts|mpeg-2ps|mpeg-2|ts*|wav|broadcastwav*|lxf|gxf*|vob*)$/)) {
      req.fileValidationError = 'Only image files are allowed!';
      return cb(new Error('Only image files are allowed!'), false);
    }
    cb(null, true);
  }
}
/**
 * @member {func} filter
 */
module.exports = VideoUploader