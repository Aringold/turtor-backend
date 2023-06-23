"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
var Assign = require('../models/assigned');
var AssignModel = Assign.model;

// function for voice answwer
var markVoiceAnswer = exports.markVoiceAnswer = function markVoiceAnswer(req, res, next) {

  var assignId = req.body.data.assign_id;
  var mark = req.body.data.mark;
  var answerId = req.body.data.answer_id;
  var questions = req.body.data.questions;
  var isCorrect = false;

  if (mark > 3.5) {
    isCorrect = true;
  }

  var answers = questions.map(function (question) {
    question.answer.assessment = question.answer.assessment._id;
    if (question.answer._id === answerId) {
      question.answer.mark = mark;
      question.answer.isCorrect = isCorrect;
    }

    return question.answer;
  });

  AssignModel.findOneAndUpdate({ _id: assignId }, {
    $set: {
      "answers": answers
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

// function for text answer
var markTextAnswer = exports.markTextAnswer = function markTextAnswer(req, res, next) {

  var assignId = req.body.data.assign_id;
  var mark = req.body.data.mark;
  var answerId = req.body.data.answer_id;
  var questions = req.body.data.questions;
  var isCorrect = false;

  if (mark > 3.5) {
    isCorrect = true;
  }

  var answers = questions.map(function (question) {
    question.answer.assessment = question.answer.assessment._id;
    if (question.answer._id === answerId) {
      question.answer.mark = mark;
      question.answer.isCorrect = isCorrect;
    }

    return question.answer;
  });

  AssignModel.findOneAndUpdate({ _id: assignId }, {
    $set: {
      "answers": answers
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