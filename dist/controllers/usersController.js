'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.updateUserInfo = exports.fetchUser = exports.insertUserByTutor = exports.fetchTutors = exports.fetchTutorsByUserId = exports.fetchUsersByTutorId = exports.perfectDeleteUsers = exports.perfectDeleteUserById = exports.deleteUsers = exports.deleteUserById = exports.changeUserStatus = exports.insertUserOrTutor = exports.deleteManyByIds = exports.fetchUsers = undefined;

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var _common = require('../helpers/common');

var User = require('../models/user').model;
var Roles = require('../models/role').Roles;
var userPaths = require('../models/user').paths;
var UserStatus = require('../models/user').UserStatus;
var getStatusValue = require('../models/user').getStatusValue;

var ObjectId = require('mongoose').Types.ObjectId;

function makeFilter(query) {
  var filter = {
    _id: query.id || null,
    email: query.email ? { $regex: new RegExp(query.email, 'gi') } : null,
    parentName: query.parentName ? { $regex: new RegExp(query.parentName, 'gi') } : null,
    gender: query.gender || null,
    level: query.level || null,
    role: query.role || null,
    status: query.status || null,
    deleted: query.deleted || null,
    // createdAt: query.createdAt ? {$gte: query.createdAt } : null,
    "address.country": query.country ? { $regex: query.country, $options: 'gi' } : null,
    "address.zipOrPostalCode": query.zipOrPostalCode ? { $regex: query.zipOrPostalCode, $options: 'gi' } : null
  };

  Object.keys(filter).forEach(function (key) {
    if (filter[key] == null || filter[key] || undefined) {
      delete filter[key];
    }
  });
  return filter;
}

/**
 * get all user for admin
 */
var fetchUsers = exports.fetchUsers = function fetchUsers(req, res, next) {
  var filter = makeFilter(req.query);
  User.find(filter).populate('level').populate('role').exec(function (err, users) {
    if (err) {
      return next(err);
    }

    if (req.query.name) {
      users = users.filter(function (user) {
        var name = user.firstname + " " + user.lastname;
        var reg = new RegExp(req.query.name, 'gi');

        return name.search(reg) > -1;
      });
    }
    res.json({
      users: users
    });
  });
};
/**
 * delete many by ids for admin only
 */
var deleteManyByIds = exports.deleteManyByIds = async function deleteManyByIds(req, res, next) {
  // const ids = ['5fbe97269e049239b8fd522b', '5fbe9b0c05f5304f1c2cdaf6', '5fbe9b0f05f5304f1c2cdaf7']
  var ids = req.body.ids;

  if ((typeof ids === 'undefined' ? 'undefined' : _typeof(ids)) != 'object') {
    return res.status(406).send({ error: "ids should be array of ids" });
  }

  var filterOption = {
    _id: null
  };

  filterOption._id = { $in: ids.map(function (id) {
      return new ObjectId(id);
    }) };

  User.remove(filterOption, function (err, result) {
    if (err) {
      return next(err);
    }
    res.json({
      sucess: true,
      result: result
    });
  });
};

/**
 * createing user by admin
 * @param {*} type  tutor | user
 */
var insertUserOrTutor = exports.insertUserOrTutor = function insertUserOrTutor(req, res, next, type) {
  var newValues = (0, _common.filterValidValues)(req.body, userPaths);
  var firstname = newValues.firstname,
      lastname = newValues.lastname,
      email = newValues.email,
      password = newValues.password,
      identificationNumber = newValues.identificationNumber,
      contactNumber = newValues.contactNumber,
      gender = newValues.gender;


  if (type != 'user' && type != 'tutor') {
    return res.status(422).send({ error: "type param required" });
  }
  if (!firstname || !lastname || !email || !password || !identificationNumber || !contactNumber || !gender) {
    return res.status(422).send({ error: "all fields are required" });
  }

  var newUser = (0, _common.deleteAllNull)(newValues);
  if (type == 'user') {
    newUser.role = Roles.user;
  } else {
    newUser.role = tutorRoleId;
  }
  newUser.status = 1; // active

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
      res.json({ success: true, user: doc });
    });
  });
};
/**
 * @param {Enumerator} type active | pending | denied |
 */
var changeUserStatus = exports.changeUserStatus = function changeUserStatus(req, res, next) {
  var type = req.params.type;
  var userId = req.body.id;

  if (type != UserStatus.PENDING || type != UserStatus.ACCEPTED || type != UserStatus.DENIED) {
    return req.status(422).send({ error: 'Correct type required' });
  }

  var typeValue = getStatusValue(type);

  User.findOneAndUpdate({ _id: userId }, { status: typeValue }, function (err, doc, result) {
    if (err) {
      return next(err);
    }

    res.jsonp({
      success: true,
      doc: doc,
      result: result
    });
  });
};
/**
 * delete user for admin
 */
var deleteUserById = exports.deleteUserById = function deleteUserById(req, res, next) {
  var id = req.params.id;

  User.updateOne({ _id: id }, { deleted: true }, function (err, result) {
    if (err) {
      return next(err);
    }
    res.json({
      sucess: true,
      result: result
    });
  });
};
var deleteUsers = exports.deleteUsers = function deleteUsers(req, res, next) {
  var ids = req.body.ids;
  if (ids && ids.length < 0) {
    res.status(422).send({ error: "ids should be an array of ids" });
  }

  User.updateOne({ _id: { $in: ids } }, { deleted: true }, function (err, result) {
    if (err) {
      return next(err);
    }
    res.json({
      sucess: true,
      result: result
    });
  });
};

var perfectDeleteUserById = exports.perfectDeleteUserById = function perfectDeleteUserById(req, res, next) {
  var id = req.params.id;

  User.deleteOne({ _id: id }, function (err, result) {
    if (err) {
      return next(err);
    }
    res.json({
      sucess: true,
      result: result
    });
  });
};
var perfectDeleteUsers = exports.perfectDeleteUsers = function perfectDeleteUsers(req, res, next) {
  var ids = req.body.ids;
  if (ids && ids.length < 0) {
    res.status(422).send({ error: "ids should be an array of ids" });
  }

  User.deleteMany({ _id: { $in: ids } }, { deleted: true }, function (err, result) {
    if (err) {
      return next(err);
    }
    res.json({
      sucess: true,
      result: result
    });
  });
};

var fetchUsersByTutorId = exports.fetchUsersByTutorId = function fetchUsersByTutorId(req, res, next) {
  var tutorId = req.user._id;
  var fields = ['firstname', 'lastname', 'email', 'gender', 'contactNumber', 'address', 'parentName', 'level', 'avatar', 'tutors', 'SecQuestionId', 'SecQestionAnswer', 'aboutMeTitle', 'aboutMe', 'role', 'status'];

  User.find({ tutors: { $all: [tutorId] } }, fields).populate('level').populate('role').exec(function (err, users) {
    if (err) {
      return next(err);
    }

    users = (0, _common.matchDownloadUrl)(users, 'avatar');

    return res.json({
      success: true,
      users: users
    });
  });
};

var fetchTutorsByUserId = exports.fetchTutorsByUserId = function fetchTutorsByUserId(req, res, next) {
  var tutors = req.user.tutors;

  User.find({ _id: { $in: tutors } }, ['_id', 'firstname', 'lastname', 'email', 'gender', 'identificationNumber', 'contactNumber', 'address.country', 'address.content', 'address.zipOrPostalCode', 'parentName', 'level', 'avatar', 'tutors', 'CA_or_SA_score', 'refCode', 'aboutMeTitle', 'aboutMe', 'role']).populate('level').populate('role').exec(function (err, users) {
    if (err) {
      return next(err);
    }
    res.json({ users: users });
  });
};

var fetchTutors = exports.fetchTutors = function fetchTutors(req, res, next) {
  User.find({ status: 1, role: { _id: Roles.tutor } }, ['_id', 'firstname', 'lastname', 'email', 'gender', 'contactNumber', 'address.country', 'address.content', 'address.zipOrPostalCode', 'avatar', 'CA_or_SA_score', 'refCode', 'aboutMeTitle', 'aboutMe', 'role']).populate('role').populate('level').exec(function (err, tutors) {
    if (err) {
      return next(err);
    }
    res.json({ tutors: tutors });
  });
};
/**
 *  creating user by tutor
 * @param {string} type tutor | student
 */
var insertUserByTutor = exports.insertUserByTutor = function insertUserByTutor(req, res, next) {
  var newValues = (0, _common.filterValidValues)(req.body, userPaths);
  var firstname = newValues.firstname,
      lastname = newValues.lastname,
      email = newValues.email,
      password = newValues.password,
      identificationNumber = newValues.identificationNumber,
      contactNumber = newValues.contactNumber,
      gender = newValues.gender;


  if (!firstname || !lastname || !email || !password || !identificationNumber || !contactNumber || !gender) {
    return res.status(422).send({ error: "all fields are required" });
  }

  var newUser = (0, _common.deleteAllNull)(newValues);

  newUser.role = Roles.user;
  newUser.status = 1; // user
  newUser.tutors = [req.user._id];

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
      res.json({ success: true, user: doc });
    });
  });
};

/**
 * fetch User
 */
var fetchUser = exports.fetchUser = function fetchUser(req, res, next) {
  var id = req.params.id;
  User.findOne({ _id: id }).populate('level').populate('role').exec(function (err, users) {
    if (err) {
      return next(err);
    }
    res.json({ users: users });
  });
};

// ***********************************************************************************
/**
 * update user info
 */
var updateUserInfo = exports.updateUserInfo = function updateUserInfo(req, res, next) {
  // need perform
  var formValues = (0, _common.filterValidValues)(req.body, userPaths);
  formValues = (0, _common.deleteAllNull)(formValues);
};