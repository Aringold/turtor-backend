'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.isUsed = exports.paths = exports.model = undefined;

var _mongoose = require('mongoose');

var _mongoose2 = _interopRequireDefault(_mongoose);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var Topic = require('./topic').model;

var Schema = _mongoose2.default.Schema;

var levelScheman = new Schema({
  name: { type: String, required: true, unique: true }, // Beginner | Advanced | intermediate | something
  description: { type: String },
  iconClassName: String, // optional
  imgUrl: { type: String }
});

var checkUsed = async function checkUsed(id) {
  var topic = await Topic.findOne({ levelId: id });

  if (topic) {
    return true;
  }

  return false;
};

var model = exports.model = _mongoose2.default.model('level', levelScheman);
var paths = exports.paths = Object.keys(levelScheman.paths);
var isUsed = exports.isUsed = checkUsed;