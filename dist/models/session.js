'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _mongoose = require('mongoose');

var _mongoose2 = _interopRequireDefault(_mongoose);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var Schema = _mongoose2.default.Schema; // login history


var sessionSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'user', required: true },

  ip: { type: String }
}, {
  timestamps: {
    createdAt: 'loginedAt',
    updatedAt: 'lastloginDate'
  }
});

exports.default = _mongoose2.default.model('session', sessionSchema);