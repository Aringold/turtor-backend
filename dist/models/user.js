'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getStatusValue = exports.UserStatus = exports.paths = exports.model = undefined;

var _mongoose = require('mongoose');

var _mongoose2 = _interopRequireDefault(_mongoose);

var _bcryptNodejs = require('bcrypt-nodejs');

var _bcryptNodejs2 = _interopRequireDefault(_bcryptNodejs);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var Role = require('./role').model;
var Schema = _mongoose2.default.Schema;

var userSchema = new Schema({
  firstname: String,
  lastname: String,
  email: { type: String, lowercase: true, unique: true },
  password: { type: String, required: true },
  auth: {
    token: String,
    used: Boolean, // email verify
    expires: Date
  },
  resetPassword: {
    token: String,
    used: Boolean,
    expires: Date
  },
  // tutor app
  gender: {
    type: String,
    default: '',
    enum: ['MALE', 'FEMALE', '']
  }, // MALE / FEMALE
  identificationNumber: { type: String, default: '' },
  contactNumber: { type: Number, default: 0 },
  address: { // optional
    country: {
      type: String,
      default: ''
    },
    content: { // city or town 
      type: [String] // array of string  # length is 2
    },
    zipOrPostalCode: {
      type: String,
      default: ''
    }
  },
  parentName: { type: String, default: '' },
  level: { type: Schema.Types.ObjectId, ref: 'level' },
  avatar: { type: String, default: 'public\\assets\\imgs\\avatar\\user-avatar.jpg' },
  tutors: [{ type: Schema.Types.ObjectId, ref: 'user' }], // ids of tutors(user collection)
  CA_or_SA_score: { type: String, default: '' },
  refCode: { type: String, default: '' }, // referal code
  SecQuestionId: { type: Schema.Types.ObjectId, ref: 'securityanswer' },
  SecQestionAnswer: { type: String, required: true },
  aboutMeTitle: { type: String, default: '' },
  aboutMe: { type: String, default: '' },
  role: { type: Schema.Types.ObjectId, ref: 'role', required: true }, // role id

  status: {
    type: Number,
    default: 0,
    enum: [0, 1, 2]
  }, // pending 0 | accepted 1 | denied 2 |
  deleted: { type: Boolean, default: false }

}, {
  timestamps: {
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
  }
});

userSchema.pre('save', function (next) {
  var user = this;

  _bcryptNodejs2.default.genSalt(10, function (err, salt) {
    if (err) {
      return next(err);
    }

    _bcryptNodejs2.default.hash(user.password, salt, null, function (err, hash) {
      if (err) {
        return next(err);
      }

      var tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);

      user.password = hash;
      user.auth = { token: salt, used: 0, expires: tomorrow };
      next();
    });
  });
});

userSchema.pre('findOne', async function (next) {
  this.populate('role');
  next();
});

userSchema.methods.comparePassword = function (candidatePassword, callback) {
  _bcryptNodejs2.default.compare(candidatePassword, this.password, function (err, isMatch) {
    if (err) {
      return callback(err);
    }

    callback(null, isMatch);
  });
};

userSchema.index({ '$**': 'text' });

var model = exports.model = _mongoose2.default.model('user', userSchema);
var paths = exports.paths = Object.keys(userSchema.paths);
var UserStatus = exports.UserStatus = {
  PENDING: 'PENDING',
  ACCEPTED: 'ACCEPTED',
  DENIED: 'DENIED'
};
var getStatusValue = exports.getStatusValue = function getStatusValue(type) {
  switch (type) {
    case UserStatus.ACCEPTED:
      return 1;
    case UserStatus.DENIED:
      return 2;
    case UserStatus.PENDING:
      return 0;
    default:
      break;
  }
};