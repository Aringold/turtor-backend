const AssignModel = require('../models/assigned').model;
const AssessmentModel = require('../models/assessment').model;
import { getFilePath, deleteReqFiles, matchDownloadUrlByStr } from "../helpers/common";

function sendError(req, code, message) {
  deleteReqFiles(req);
  return res.status(code).send({error: message})
}

async function getAlreadyAnswered(assignId, assessmentId) {

  var condition = {
    _id: assignId, 
    answers: {
      $elemMatch: {
        assessment: assessmentId
      }
    }
  }

  var assignDoc = await AssignModel.findOne(condition);

  return assignDoc;
}

// for mcq and text
export const saveAnswersByType = async function (req, res, next) {
  const assignId = req.params.assignId;
  const questionType = req.params.type;
  const bodyData = req.body;

  const alreadyAnswered = await getAlreadyAnswered(assignId, bodyData.assessmentId);
  if(alreadyAnswered) {
    return res.status(403).send({error: "already answered"})
  }

  const assessmentDoc = await AssessmentModel.findOne({_id: bodyData.assessmentId});

  if(assessmentDoc) {
    var answer = {}
    switch (questionType) {
      case "MCQ":
        var MCQs = assessmentDoc.MCQs;
        var correctMCQ = MCQs.find((elt) => elt.isCorrect == true);
        var isCorrect = correctMCQ.index == bodyData.selectedIndex;
        var mark = isCorrect == true ? assessmentDoc.mark : 0;

        answer = {
          assessment: bodyData.assessmentId,
          isMCQ: true,
          selectedIndex: bodyData.selectedIndex,
          mark: mark,
          isCorrect: isCorrect
        }

        break;
      case "TEXT":
        answer = {
          assessment: bodyData.assessmentId,
          isMCQ: false,
          textAnswer: bodyData.textAnswer,
        }
        break;
      default:
        return res.status(422).send({error: "please pass correct type"})
        break;
    }

    AssignModel.updateOne(
      {_id: assignId },
      {
        $push: {
          "answers": answer
        }
      },
      function (err, result) {
        if(err) { 
          return next(err)
        } 

        res.json({
          success: true,
          result: result
        })
      })
  } else {
    return res.status(422).send({
      error: "This question does not exists"
    })
  }
}

export const saveVoiceAnswer = async function (req, res, next) {
  const assignId = req.params.assignId;
  const bodyData = req.body;
  const alreadyAnswered = await getAlreadyAnswered(assignId, bodyData.assessmentId);

  if(alreadyAnswered) {
    return sendError(req, 403, "already answered");
  }

  var answer = {
    assessment: bodyData.assessmentId,
    isMCQ: false,
    voiceUrl: "",
  }

  if(req.files && req.files.length > 0) {
    for (const i in req.files) {
      var file = req.files[i];

      if (file.fieldname == 'voiceFile') {
        if(file.path) {
          answer.voiceUrl = getFilePath(file.path);
        } else {
          console.error("----------------------------")
          console.error("voice file wasnt be uploaded!")
          console.error("----------------------------")
        }
      }
    }
  } else {
    return sendError(req, 422, "you need to record!");
  }

  AssignModel.findOneAndUpdate(
    {_id: assignId },
    {
      $push: {
        "answers": answer
      }
    },
    function (err, doc, result) {
      if(err) { 
        return next(err)
      } 

      res.json({
        success: true,
        result: result
      })
    })
}

export const fetchAnswerByAssess_Assign = async function (req, res, next) {
  const { assessmentId, assignId } = req.params;

  try{
    var assign = await getAlreadyAnswered(assignId, assessmentId);
    if(!assign) {
      return res.json({
        success: true,
        answers: []
      })
    }
    
    var answers = assign.answers;

    if(answers && answers.length > 0){
      answers = answers.map((elt) => {
        if(elt.voiceUrl) {
          elt.voiceUrl = matchDownloadUrlByStr(elt.voiceUrl)
        }
        return elt;
      })
    }

    res.json({
      success: true,
      answers: assign.answers
    })
  } catch(e) {
    next(e)
  }
} 