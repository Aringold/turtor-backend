'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.ReviewTypes = exports.paths = exports.model = undefined;

var _mongoose = require('mongoose');

var _mongoose2 = _interopRequireDefault(_mongoose);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var Schema = _mongoose2.default.Schema;

var reviewSchema = new Schema({
  reviewId: { type: Schema.Types.ObjectId, required: true }, // id of  lesson | user
  description: { type: String, default: '' },
  stars: {
    type: Number,
    min: 0,
    max: 5,
    required: true
  },
  type: {
    type: String,
    enum: ['LESSON', 'USER'],
    required: true
  }, // lesson | assement | user |  // site # optional
  createdBy: { type: Schema.Types.ObjectId, ref: 'user' }
}, {
  timestamps: {
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
  }
});

var model = exports.model = _mongoose2.default.model('review', reviewSchema);
var paths = exports.paths = Object.keys(reviewSchema.paths);
var ReviewTypes = exports.ReviewTypes = {
  LESSON: 'LESSON',
  ASSESSMENT: 'ASSESSMENT',
  USER: 'USER'
};