const fs = require('fs');
const multer = require('multer');
import path from 'path';
const { uuid } = require('uuidv4');

class UploaderManager {
  constructor(filePath) {
    this.assetsPath = filePath;
    this.storage = multer.diskStorage({
      destination: function(req, file, cb) {
        /**
         * cb(null, './public/assets/imgs');
         */
          cb(null, filePath);
      },
      // By default, multer removes file extensions so let's add them back
      filename: function(req, file, cb) {
        cb(null, file.fieldname + '-' + uuid() + '-' + Date.now() + path.extname(file.originalname));
      }
    });
  }
}
/**
 * @member {multer.diskStorage} storage
 */
module.exports  = UploaderManager;