'use strict';

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var multer = require('multer');

var _require = require('uuidv4'),
    uuid = _require.uuid;

module.exports = function (root) {
  var storage = multer.diskStorage({
    destination: function destination(req, file, cb) {
      cb(null, root);
    },
    filename: function filename(req, file, cb) {
      cb(null, file.fieldname + '-' + uuid() + '-' + Date.now() + _path2.default.extname(file.originalname));
    }
  });

  var Uploader = multer({ storage: storage });
  return Uploader;
};