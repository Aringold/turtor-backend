'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.isUsed = exports.TopicType = exports.paths = exports.model = undefined;

var _mongoose = require('mongoose');

var _mongoose2 = _interopRequireDefault(_mongoose);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var Assessment = require('./assessment').model;
var Lesson = require('./lesson').model;
var WorkSheet = require('./worksheet').model;

var Schema = _mongoose2.default.Schema;
var ObjectId = Schema.Types.ObjectId;


var topicSchema = new Schema({
  name: {
    type: String,
    required: true
  },
  description: { type: String, default: '' },
  levelId: { type: ObjectId, ref: 'level' },
  categoryId: { type: ObjectId, ref: 'category' },
  type: {
    type: String,
    required: true,
    enum: ['LESSON', 'ASSESSMENT']
  },
  createdBy: {
    type: ObjectId,
    ref: 'user',
    required: true
  }
}, {
  timestamps: {
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
  }
});

var checkUsed = async function checkUsed(id) {

  // check assessment
  var assessment = await Assessment.findOne({ topic: id });

  if (assessment) {
    return true;
  }
  if (!assessment) {
    var lesson = await Lesson.findOne({ topic: id });

    if (lesson) {
      return true;
    }

    var worksheet = await WorkSheet.find({ topicId: id });
    if (worksheet) {
      return true;
    }
  }

  return false;
};

var model = exports.model = _mongoose2.default.model('topic', topicSchema);
var paths = exports.paths = Object.keys(topicSchema.paths);
var TopicType = exports.TopicType = {
  LESSON: "LESSON",
  ASSESSMENT: "ASSESSMENT"
};
var isUsed = exports.isUsed = checkUsed;