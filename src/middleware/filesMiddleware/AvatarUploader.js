const ImageUploader = require('./ImageUploader');

class AvatarUploader extends ImageUploader{
  constructor(filepath){
    super(filepath);

    this.limits = {
      fileSize: 1024 * 1024
    }
  }
}

/**
 * @param {func} limit
 */
module.exports  = AvatarUploader;