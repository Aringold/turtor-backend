'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.paths = exports.model = undefined;

var _mongoose = require('mongoose');

var _mongoose2 = _interopRequireDefault(_mongoose);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var Schema = _mongoose2.default.Schema;
var ObjectId = Schema.Types.ObjectId;


var assignedSchema = new Schema({
  title: {
    type: String,
    default: ''
  },
  description: {
    type: String,
    default: ''
  },
  worksheet: {
    type: ObjectId,
    ref: 'worksheet',
    required: true
  },
  answers: [{
    assessment: {
      type: ObjectId,
      ref: 'assessment',
      required: true
    },
    isMCQ: {
      type: Boolean,
      default: false
    },
    selectedIndex: { // for mcq
      type: Number
    },
    mark: { // for text and voice || and mark
      type: Number,
      default: 0
    },
    textAnswer: {
      type: String
    },
    voiceUrl: {
      type: String
    },
    isCorrect: {
      type: Boolean
    }
  }],
  assignedTo: {
    type: ObjectId,
    ref: 'user',
    required: true
  },
  readBy: [// optional
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'user'
    },
    readedAt: {
      type: Date
    }
  }],
  createdBy: {
    type: Schema.Types.ObjectId,
    ref: 'user'
  },
  new: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: {
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
  }
});

var model = exports.model = _mongoose2.default.model('assigned', assignedSchema);
var paths = exports.paths = Object.keys(assignedSchema.paths);