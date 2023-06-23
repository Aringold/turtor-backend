'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Roles = exports.model = undefined;

var _mongoose = require('mongoose');

var _mongoose2 = _interopRequireDefault(_mongoose);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var Schema = _mongoose2.default.Schema;

var roleSchema = new Schema({
  // id: { type: Number, required: true, unique: true },
  name: { type: String, required: true, unique: true }
});
var model = exports.model = _mongoose2.default.model('role', roleSchema);
var Roles = exports.Roles = {
  admin: "5fbee2782536a34bcc53c651",
  tutor: "5fbee287f63ef22be4432b44",
  user: "5fbee28ee5be073ac0ef0d83"
};