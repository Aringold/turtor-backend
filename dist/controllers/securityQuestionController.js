'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.deleteQuestionByIds = exports.deleteQuestionById = exports.getAll = exports.update = exports.createNew = undefined;

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var _securityQuestion = require('../models/securityQuestion');

var _securityQuestion2 = _interopRequireDefault(_securityQuestion);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var ObjectId = require('mongoose').Types.ObjectId;

// done
var createNew = exports.createNew = function createNew(req, res, next) {
  var question = req.body.question;


  if (!question) {
    return res.status(422).send({ error: "Question is required" });
  }

  var newQuestion = new _securityQuestion2.default({
    question: question
  });
  newQuestion.save(function (err, doc) {
    if (err) {
      return next(err);
    }
    res.json({
      success: true,
      doc: doc
    });
  });
};

// done
var update = exports.update = function update(req, res, next) {
  var question = req.body.question;

  var id = req.params.id;

  _securityQuestion2.default.findByIdAndUpdate(id, { question: question }, function (err, doc) {
    if (err) {
      return next(err);
    }
    res.json({
      success: true,
      doc: doc
    });
  });
};
// done
var getAll = exports.getAll = function getAll(req, res, next) {

  _securityQuestion2.default.find({}, function (err, docs) {
    if (err) {
      return next(err);
    }
    res.json({
      success: true,
      securityQuestions: docs
    });
  });
};

// done
var deleteQuestionById = exports.deleteQuestionById = function deleteQuestionById(req, res, next) {
  var id = req.params.id;

  _securityQuestion2.default.deleteOne({ _id: id }, function (err, result) {
    if (err) {
      return next(err);
    }
    res.json({
      success: true,
      result: result
    });
  });
};

// done
var deleteQuestionByIds = exports.deleteQuestionByIds = async function deleteQuestionByIds(req, res, next) {
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

  _securityQuestion2.default.remove(filterOption, function (err, result) {
    if (err) {
      return next(err);
    }
    res.json({
      success: true,
      result: result
    });
  });
};