'use strict';

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var fs = require('fs');
var multer = require('multer');

var _require = require('uuidv4'),
    uuid = _require.uuid;

var UploaderManager = function UploaderManager(filePath) {
  _classCallCheck(this, UploaderManager);

  this.assetsPath = filePath;
  this.storage = multer.diskStorage({
    destination: function destination(req, file, cb) {
      /**
       * cb(null, './public/assets/imgs');
       */
      cb(null, filePath);
    },
    // By default, multer removes file extensions so let's add them back
    filename: function filename(req, file, cb) {
      cb(null, file.fieldname + '-' + uuid() + '-' + Date.now() + _path2.default.extname(file.originalname));
    }
  });
};
/**
 * @member {multer.diskStorage} storage
 */


module.exports = UploaderManager;