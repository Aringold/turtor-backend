'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.isUsedWorkSheet = exports.paths = exports.model = undefined;

var _mongoose = require('mongoose');

var _mongoose2 = _interopRequireDefault(_mongoose);

var _assigned = require('./assigned');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var Schema = _mongoose2.default.Schema;
var ObjectId = Schema.Types.ObjectId;


var workSheetSchema = new Schema({
  name: {
    type: String,
    unique: true
    // required: true
  },
  description: { type: String, default: '' },
  assessments: [{
    type: ObjectId,
    ref: 'assessment'
  }],
  createdBy: {
    type: ObjectId,
    ref: 'user',
    required: true
  },
  topicId: {
    type: ObjectId,
    ref: 'topic',
    required: true
  }
}, {
  timestamps: {
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
  }
});

var isUsed = async function isUsed(id) {
  var assignedTask = await _assigned.model.findOne({ worksheet: id });

  return assignedTask;
};

var model = exports.model = _mongoose2.default.model('worksheet', workSheetSchema);
var paths = exports.paths = Object.keys(workSheetSchema.paths);
var isUsedWorkSheet = exports.isUsedWorkSheet = isUsed;