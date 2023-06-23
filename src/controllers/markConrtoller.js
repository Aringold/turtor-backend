const Assign = require('../models/assigned');
const AssignModel = Assign.model;

 // function for voice answwer
export const markVoiceAnswer  = function (req, res, next) {
    
    var assignId = req.body.data.assign_id;
    var mark = req.body.data.mark;
    var answerId = req.body.data.answer_id;
    var questions = req.body.data.questions;
    var isCorrect = false;

    if (mark > 3.5) {
      isCorrect = true;
    }

    var answers = questions.map((question) => {
      question.answer.assessment = question.answer.assessment._id
      if(question.answer._id === answerId) {
        question.answer.mark = mark;
        question.answer.isCorrect = isCorrect;
      }

      return question.answer;
    });

    AssignModel.findOneAndUpdate(
        { _id: assignId },
        {
          $set: {
            "answers": answers
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
    });
}

 // function for text answer
export const markTextAnswer  = function (req, res, next) {
  
  var assignId = req.body.data.assign_id;
  var mark = req.body.data.mark;
  var answerId = req.body.data.answer_id;
  var questions = req.body.data.questions;
  var isCorrect = false;

  if (mark > 3.5) {
    isCorrect = true;
  }

  var answers = questions.map((question) => {
    question.answer.assessment = question.answer.assessment._id
    if(question.answer._id === answerId) {
      question.answer.mark = mark;
      question.answer.isCorrect = isCorrect;
    }

    return question.answer;
  });

  AssignModel.findOneAndUpdate(
      { _id: assignId },
      {
        $set: {
          "answers": answers
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
  });

}