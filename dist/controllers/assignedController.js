'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.fetchAssignedListByFilter = exports.updateAnswer = exports.makeMark = exports.fetchAssignedTaskForUser = exports.deletAssignedTask = exports.updateAssign = exports.assignTask = undefined;

var _common = require('../helpers/common');

var _role = require('../models/role');

var AssignedModel = require('./../models/assigned');
var Assessment = require('./../models/assessment').model;
var Topic = require('./../models/topic').model;
var Assign = AssignedModel.model;
var Paths = AssignedModel.paths;


/**
 * @param {Object} req.query
 * need to implete for topic, categories
 */
async function makeFilter(query) {
  var filter = {
    _id: query.id || null,
    title: query.title || null,
    worksheet: query.worksheet || null, // worksheetid
    assignedTo: query.assignedTo || null, // id of user
    updatedAt: query.updatedAt || null, // date
    createdBy: query.createdBy || null, // id of tutor(usr  table) 
    createdAt: null
  };

  if (query.title) {
    var rex = RegExp(query.title, 'gi');
    filter.title = { $regex: rex };
  }
  if (query.startTime && query.endTime) {
    filter.createdAt = { $gte: new Date(query.startTime), $lt: new Date(query.endTime) };
  }

  Object.keys(filter).forEach(function (key) {
    if (filter[key] == null) {
      delete filter[key];
    }
  });

  return filter;
}

var assignTask = exports.assignTask = async function assignTask(req, res, next) {
  var validObj = (0, _common.filterValidValues)(req.body, Paths);

  if (!(0, _common.hasOwnProperties)(validObj, ['title', 'worksheet', 'assignedTo'])) {
    return res.status(422).send({ error: "title, worksheet are required or You didnt select Student" });
  }

  // check already assigned worksheet
  Assign.findOne({
    worksheet: validObj.worksheet,
    assignedTo: validObj.assignedTo,
    createdBy: req.user._id
  }, function (err, doc) {
    if (err) {
      return next(err);
    }
    if (doc) {
      return res.status(422).send({ error: "You are already assigned!" });
    }

    var newAssign = new Assign({
      title: validObj.title || "",
      description: validObj.description || "",
      worksheet: validObj.worksheet,
      assignedTo: validObj.assignedTo,
      createdBy: req.user._id
    });

    newAssign.save(function (err1, doc) {
      if (err1) {
        return next(err1);
      }

      res.json({
        success: true,
        assign: doc
      });
    });
  });
};

var updateAssign = exports.updateAssign = function updateAssign(req, res, next) {
  var id = req.params.id;

  Assign.findOne({
    _id: { $nin: id },
    worksheet: req.body.worksheet,
    assignedTo: req.body.assignedTo,
    createdBy: req.user._id
  }, function (err, doc) {
    if (err) {
      return next(err);
    }
    if (doc) {
      return res.status(422).send({ error: "Already Assigned!" });
    }
    Assign.updateOne({ _id: id }, {
      title: req.body.title,
      description: req.body.description,
      worksheet: req.body.worksheet
    }, {
      omitUndefined: true
    }, async function (err) {
      if (err) {
        return next(err);
      }
      var doc = await Assign.findOne({ _id: id }).populate("worksheet").populate("assignedTo").populate("createdBy").populate("answers.assessment").exec();

      res.json({
        success: true,
        assign: doc
      });
    });
  });
};

var deletAssignedTask = exports.deletAssignedTask = async function deletAssignedTask(req, res, next) {
  var id = req.params.id;

  if (req.user.role._id == _role.Roles.admin) {
    Assign.deleteOne({ _id: id }, function (err, result) {
      if (err) {
        return next(err);
      }
      res.json({
        success: true,
        result: result
      });
    });
  } else {
    Assign.deleteOne({ _id: id, createdBy: req.user._id }, function (err, result) {
      if (err) {
        return next(err);
      }

      res.json({
        success: true,
        result: result
      });
    });
  }
};

var fetchAssignedTaskForUser = exports.fetchAssignedTaskForUser = async function fetchAssignedTaskForUser(req, res, next) {
  var query = req.query;
  query.assignedTo = req.user._id;
  // filter
  var filer = makeFilter(query);

  Assign.find(filer).populate("worksheet").populate({
    path: 'assignedTo',
    select: ['_id', 'firstname', 'lastname']
  }).populate({
    path: 'createdBy',
    select: ['_id', 'firstname', 'lastname']
  }).populate("answers.assessment").exec(function (err, docs) {
    if (err) {
      return next(err);
    }
    res.json({
      success: true,
      assignedTasks: docs
    });
  });
};

var makeMark = exports.makeMark = async function makeMark(req, res, next) {
  var id = req.params.id;
  var mark = req.body.mark;

  Assessment.findOneAndUpdate({ _id: id, createdBy: req.user._id }, { mark: mark }, function (err, doc, result) {
    if (err) {
      return next(err);
    }

    res.json({
      success: true,
      result: result
    });
  });
};

var updateAnswer = exports.updateAnswer = async function updateAnswer(req, res, next) {
  var id = req.params.id;
  var _req$body = req.body,
      answerVoice = _req$body.answerVoice,
      answerText = _req$body.answerText,
      selectedMCQIndex = _req$body.selectedMCQIndex;


  Assign.findOneAndUpdate({ _id: id, assignedTo: req.user._id }, { answerVoice: answerVoice, answerText: answerText, selectedMCQIndex: selectedMCQIndex }, { omitUndefined: false }, function (err, doc, result) {
    if (err) {
      return next(err);
    }
    res.json({
      success: true,
      result: result
    });
  });
};

var fetchAssignedListByFilter = exports.fetchAssignedListByFilter = async function fetchAssignedListByFilter(req, res, next) {
  var query = req.query;
  var filter = await makeFilter(query);

  Assign.find(filter).populate({
    path: 'worksheet',
    model: "worksheet",
    populate: {
      path: 'assessments',
      model: "assessment"
    }
  }).populate({
    path: 'assignedTo',
    select: ['_id', 'firstname', 'lastname']
  }).populate({
    path: 'createdBy',
    select: ['_id', 'firstname', 'lastname']
  }).populate("answers.assessment").exec(function (err, docs) {
    if (err) {
      return next(error);
    }
    _common.matchDownloadUrl;
    docs = docs.map(function (doc) {
      if (doc.answers && doc.answers.length > 0) {
        doc.answers = doc.answers.map(function (answer) {
          if (answer.voiceUrl) {
            answer.voiceUrl = (0, _common.matchDownloadUrlByStr)(answer.voiceUrl);
          }
          return answer;
        });
      }
      return doc;
    });

    res.json({
      success: true,
      assignedList: docs
    });
  });
};