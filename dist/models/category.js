'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.isUsedData = exports.paths = exports.model = undefined;

var _mongoose = require('mongoose');

var _mongoose2 = _interopRequireDefault(_mongoose);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var Topic = require('./topic').model;

var Schema = _mongoose2.default.Schema;

var categorySchema = new Schema({
  name: { type: String, unique: true, required: true }, // title
  iconClassName: String, // optional
  imgUrl: { type: String },
  description: { type: String, default: "" }, // optional
  slug: { type: String }, // optional
  children: [{
    type: Schema.Types.ObjectId,
    ref: 'category'
  }],
  isParent: { // optional
    type: Boolean,
    default: true
  }
});

var checkUsed = async function checkUsed(id) {
  var topic = await Topic.findOne({ categoryId: id });

  if (topic) {
    return true;
  }

  return false;
};

var model = exports.model = _mongoose2.default.model('category', categorySchema);
var paths = exports.paths = Object.keys(categorySchema.paths);
var isUsedData = exports.isUsedData = checkUsed;