'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.fetchAnswerByAssess_Assign = exports.saveVoiceAnswer = exports.saveAnswersByType = undefined;

var _common = require('../helpers/common');

var AssignModel = require('../models/assigned').model;
var AssessmentModel = require('../models/assessment').model;


function sendError(req, code, message) {
  (0, _common.deleteReqFiles)(req);
  return res.status(code).send({ error: message });
}

async function getAlreadyAnswered(assignId, assessmentId) {

  var condition = {
    _id: assignId,
    answers: {
      $elemMatch: {
        assessment: assessmentId
      }
    }
  };

  var assignDoc = await AssignModel.findOne(condition);

  return assignDoc;
}

// for mcq and text
var saveAnswersByType = exports.saveAnswersByType = async function saveAnswersByType(req, res, next) {
  var assignId = req.params.assignId;
  var questionType = req.params.type;
  var bodyData = req.body;

  var alreadyAnswered = await getAlreadyAnswered(assignId, bodyData.assessmentId);
  if (alreadyAnswered) {
    return res.status(403).send({ error: "already answered" });
  }

  var assessmentDoc = await AssessmentModel.findOne({ _id: bodyData.assessmentId });

  if (assessmentDoc) {
    var answer = {};
    switch (questionType) {
      case "MCQ":
        var MCQs = assessmentDoc.MCQs;
        var correctMCQ = MCQs.find(function (elt) {
          return elt.isCorrect == true;
        });
        var isCorrect = correctMCQ.index == bodyData.selectedIndex;
        var mark = isCorrect == true ? assessmentDoc.mark : 0;

        answer = {
          assessment: bodyData.assessmentId,
          isMCQ: true,
          selectedIndex: bodyData.selectedIndex,
          mark: mark,
          isCorrect: isCorrect
        };

        break;
      case "TEXT":
        answer = {
          assessment: bodyData.assessmentId,
          isMCQ: false,
          textAnswer: bodyData.textAnswer
        };
        break;
      default:
        return res.status(422).send({ error: "please pass correct type" });
        break;
    }

    AssignModel.updateOne({ _id: assignId }, {
      $push: {
        "answers": answer
      }
    }, function (err, result) {
      if (err) {
        return next(err);
      }

      res.json({
        success: true,
        result: result
      });
    });
  } else {
    return res.status(422).send({
      error: "This question does not exists"
    });
  }
};

var saveVoiceAnswer = exports.saveVoiceAnswer = async function saveVoiceAnswer(req, res, next) {
  var assignId = req.params.assignId;
  var bodyData = req.body;
  var alreadyAnswered = await getAlreadyAnswered(assignId, bodyData.assessmentId);

  if (alreadyAnswered) {
    return sendError(req, 403, "already answered");
  }

  var answer = {
    assessment: bodyData.assessmentId,
    isMCQ: false,
    voiceUrl: ""
  };

  if (req.files && req.files.length > 0) {
    for (var i in req.files) {
      var file = req.files[i];

      if (file.fieldname == 'voiceFile') {
        if (file.path) {
          answer.voiceUrl = (0, _common.getFilePath)(file.path);
        } else {
          console.error("----------------------------");
          console.error("voice file wasnt be uploaded!");
          console.error("----------------------------");
        }
      }
    }
  } else {
    return sendError(req, 422, "you need to record!");
  }

  AssignModel.findOneAndUpdate({ _id: assignId }, {
    $push: {
      "answers": answer
    }
  }, function (err, doc, result) {
    if (err) {
      return next(err);
    }

    res.json({
      success: true,
      result: result
    });
  });
};

var fetchAnswerByAssess_Assign = exports.fetchAnswerByAssess_Assign = async function fetchAnswerByAssess_Assign(req, res, next) {
  var _req$params = req.params,
      assessmentId = _req$params.assessmentId,
      assignId = _req$params.assignId;


  try {
    var assign = await getAlreadyAnswered(assignId, assessmentId);
    if (!assign) {
      return res.json({
        success: true,
        answers: []
      });
    }

    var answers = assign.answers;

    if (answers && answers.length > 0) {
      answers = answers.map(function (elt) {
        if (elt.voiceUrl) {
          elt.voiceUrl = (0, _common.matchDownloadUrlByStr)(elt.voiceUrl);
        }
        return elt;
      });
    }

    res.json({
      success: true,
      answers: assign.answers
    });
  } catch (e) {
    next(e);
  }
};