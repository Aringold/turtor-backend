'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var UploaderManager = require('./UploaderManager');

var VideoUploader = function (_UploaderManager) {
  _inherits(VideoUploader, _UploaderManager);

  function VideoUploader(filepath) {
    _classCallCheck(this, VideoUploader);

    return _possibleConstructorReturn(this, (VideoUploader.__proto__ || Object.getPrototypeOf(VideoUploader)).call(this, filepath));
  }

  _createClass(VideoUploader, [{
    key: 'filter',
    value: function filter(req, file, cb) {
      // Accept images only
      if (!file.originalname.match(/\.(mp4|mp4|m4a|m4v|f4v|f4a|m4b|m4r|f4b|mov|3gp|3gp|3gp2|3g2|3gpp|3gpp2|ogg|ogg|oga|ogv|ogx|wmv|wmv|wma|asf*|webm|webm|flv|flv|avi*|quicktime*|hdv*mxf|op1a|op-atom|*mpeg-ts|ts|mpeg-2ps|mpeg-2|ts*|wav|broadcastwav*|lxf|gxf*|vob*)$/)) {
        req.fileValidationError = 'Only image files are allowed!';
        return cb(new Error('Only image files are allowed!'), false);
      }
      cb(null, true);
    }
  }]);

  return VideoUploader;
}(UploaderManager);
/**
 * @member {func} filter
 */


module.exports = VideoUploader;