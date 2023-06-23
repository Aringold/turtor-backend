'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.isUsed = exports.paths = exports.model = undefined;

var _mongoose = require('mongoose');

var _mongoose2 = _interopRequireDefault(_mongoose);

var _worksheet = require('./worksheet');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var Schema = _mongoose2.default.Schema;

var assessmentSchema = new Schema({
  topic: {
    type: Schema.Types.ObjectId,
    ref: 'topic',
    required: true
  },
  level: {
    type: Schema.Types.ObjectId,
    ref: 'level',
    required: true
  },
  mark: { type: Number, min: 0, max: 10, default: 0 }, // 1 - 10 number
  question: {
    type: String,
    // unique: true, 
    required: true
  },
  description: { type: String, default: '' },
  imgUrl: { type: String, default: '' },
  videos: [String], // array of Url string
  youtubeUrl: { type: String, default: '' },
  isMCQ: { type: Boolean, default: false },
  MCQs: [{
    index: { type: Number, min: 0 },
    text: { type: String, default: '' },
    isCorrect: { type: Boolean, default: false }
  }],
  tags: [String], // array of string // # optional
  createdBy: {
    type: Schema.Types.ObjectId,
    ref: 'user'
  },
  deleted: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: {
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
  }
});

var checkUsed = async function checkUsed(id) {
  var worksheet = await _worksheet.model.findOne({ assessments: { $all: [id] } }).exec();
  if (worksheet) {
    return true;
  }

  return false;
};

var model = exports.model = _mongoose2.default.model('assessment', assessmentSchema);
var paths = exports.paths = Object.keys(assessmentSchema.paths);
var isUsed = exports.isUsed = checkUsed;