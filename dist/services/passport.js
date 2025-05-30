'use strict';

var _passport = require('passport');

var _passport2 = _interopRequireDefault(_passport);

var _config = require('../config');

var _passportLocal = require('passport-local');

var _passportLocal2 = _interopRequireDefault(_passportLocal);

var _passportJwt = require('passport-jwt');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var User = require('../models/user').model;;


var localOptions = { usernameField: 'email' };

var localLogin = new _passportLocal2.default(localOptions, function (email, password, done) {

  User.findOne({ email: email }, function (err, user) {
    if (err) {
      return done(err);
    }

    if (!user) {
      return done(null, false);
    }

    user.comparePassword(password, function (err, isMatch) {
      if (err) {
        return done(err);
      }

      if (!isMatch) {
        return done(null, false);
      }

      if (user.role < 1) {
        console.log("user.role < 1 passport line 21");
        return done(null, false);
      }

      return done(null, user);
    });
  });
});

var jwtOptions = {
  jwtFromRequest: _passportJwt.ExtractJwt.fromHeader('authorization'),
  secretOrKey: _config.dbConfig.secret
};

var jwtLogin = new _passportJwt.Strategy(jwtOptions, function (payload, done) {
  User.findOne({ _id: payload.sub }, function (err, user) {
    if (err) {
      return done(err, false);
    }

    if (user) {
      done(null, user);
    } else {
      done(null, false);
    }
  });
});

_passport2.default.use(jwtLogin);
_passport2.default.use(localLogin);