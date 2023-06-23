'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.verifiEmail = exports.resendVerification = exports.isNotUser = exports.requireTutor = exports.requireAdmin = exports.registerStudent = exports.signin = undefined;

var _nodemailer = require('nodemailer');

var _nodemailer2 = _interopRequireDefault(_nodemailer);

var _bcryptNodejs = require('bcrypt-nodejs');

var _bcryptNodejs2 = _interopRequireDefault(_bcryptNodejs);

var _email = require('../helpers/email');

var _token = require('../helpers/token');

var _common = require('../helpers/common');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var User = require('../models/user').model;
var Roles = require('../models/role').Roles;
var userPaths = require('../models/user').paths;
var userRoleId = Roles.user;
var tutorRoleId = Roles.tutor;
/**
 * Sign in
 */
var signin = exports.signin = function signin(req, res) {
  var _req$user = req.user,
      firstname = _req$user.firstname,
      lastname = _req$user.lastname,
      email = _req$user.email,
      role = _req$user.role,
      status = _req$user.status,
      avatar = _req$user.avatar,
      _id = _req$user._id;


  res.json({
    token: (0, _token.tokenForUser)(req.user),
    firstname: firstname,
    lastname: lastname,
    id: _id,
    email: email,
    role: role,
    status: status,
    avatar: (0, _common.matchDownloadUrlByStr)(avatar)
  });
};

/**
 * Sign up
 */
var registerStudent = exports.registerStudent = function registerStudent(req, res, next) {
  var newValues = (0, _common.filterValidValues)(req.body, userPaths);
  var type = req.params.type;
  var firstname = newValues.firstname,
      lastname = newValues.lastname,
      email = newValues.email,
      password = newValues.password,
      identificationNumber = newValues.identificationNumber,
      contactNumber = newValues.contactNumber,
      gender = newValues.gender,
      level = newValues.level,
      SecQuestionId = newValues.SecQuestionId,
      SecQestionAnswer = newValues.SecQestionAnswer;


  var newUser = (0, _common.deleteAllNull)(newValues);
  if (type != 'user' && type != 'tutor') {
    return res.status(422).send({ error: "type param required" });
  }
  if (type == 'user') {
    if (!firstname || !lastname || !email || !password || !identificationNumber || !contactNumber || !gender || !level || !SecQuestionId || !SecQestionAnswer) {
      return res.status(422).send({ error: "all fields are required" });
    }
    newUser.role = userRoleId;
    newUser.status = 1; // user
  } else {
    if (!firstname || !lastname || !email || !password || !identificationNumber || !contactNumber || !gender || !SecQuestionId || !SecQestionAnswer) {
      return res.status(422).send({ error: "all fields are required" });
    }
    newUser.role = tutorRoleId;
    newUser.status = 0; // tutor
  }

  User.findOne({ email: email }, function (err, existingUser) {
    if (err) {
      return next(err);
    }

    if (existingUser) {
      return res.status(422).send({ error: "Email is in use" });
    }

    var user = new User(newUser);

    user.save(function (err, doc) {
      if (err) {
        return next(err);
      }
      // sendVerificationEmail(email, firstname, user.auth.token); 
      res.json({ success: true });
    });
  });
};
/**
 * require Admin
 */
var requireAdmin = exports.requireAdmin = function requireAdmin(req, res, next) {
  if (req.user.role._id != Roles.admin) {
    return res.status(401).send({ error: "Admin permission required" });
  }
  next(null, true);
};
var requireTutor = exports.requireTutor = function requireTutor(req, res, next) {
  if (req.user.role._id != Roles.tutor) {
    return res.status(401).send({ error: "Tutor permition required" });
  }
  next(null, true);
};
var isNotUser = exports.isNotUser = function isNotUser(req, res, next) {
  if (req.user.role._id == Roles.user) {
    return res.status(401).send({ error: "required permition" });
  }
  next(null, true);
};
/**
 * Resend verification code
 */
var resendVerification = exports.resendVerification = function resendVerification(req, res, next) {
  var email = req.body.email;


  User.findOne({ email: email }, function (err, user) {
    if (err) {
      return next(err);
    }

    var tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);

    User.findByIdAndUpdate(user.id, { auth: { used: false, token: user.auth.token, expires: tomorrow } }, function (err) {
      if (err) {
        return next(err);
      }

      var firstname = user.firstname,
          email = user.email;


      (0, _email.sendVerificationEmail)(email, firstname, user.auth.token);

      res.json({ success: true });
    });
  });
};

/**
 * Verify email
 */
var verifiEmail = exports.verifiEmail = function verifiEmail(req, res, next) {
  var _req$body = req.body,
      email = _req$body.email,
      token = _req$body.token;


  User.findOne({ email: email }, function (err, user) {
    if (err) {
      return next(err);
    }

    if (!user) {
      return res.status(422).send({ error: { message: "User doesnt exists", resend: false } });
    }

    if (user.auth.used) {
      return res.status(422).send({ error: { message: "link already used", resend: false } });
    }

    if (new Date() > user.auth.expires) {
      return res.status(422).send({ error: { message: "link already expired", resend: true } });
    }

    if (token !== user.auth.token) {
      return res.status(422).send({ error: { message: "something has gone wrong, please sign up again", resend: false } });
    }

    User.findByIdAndUpdate(user.id, { role: 1, auth: { used: true } }, function (err) {
      if (err) {
        return next(err);
      }

      var email = user.email,
          firstname = user.firstname,
          lastname = user.lastname;


      res.json({ token: (0, _token.tokenForUser)(user), email: email, firstname: firstname, lastname: lastname });
    });
  });
};