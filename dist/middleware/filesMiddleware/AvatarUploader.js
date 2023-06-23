'use strict';

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var ImageUploader = require('./ImageUploader');

var AvatarUploader = function (_ImageUploader) {
  _inherits(AvatarUploader, _ImageUploader);

  function AvatarUploader(filepath) {
    _classCallCheck(this, AvatarUploader);

    var _this = _possibleConstructorReturn(this, (AvatarUploader.__proto__ || Object.getPrototypeOf(AvatarUploader)).call(this, filepath));

    _this.limits = {
      fileSize: 1024 * 1024
    };
    return _this;
  }

  return AvatarUploader;
}(ImageUploader);

/**
 * @param {func} limit
 */


module.exports = AvatarUploader;