import SecurityQuestionModel from '../models/securityQuestion';
const ObjectId = require('mongoose').Types.ObjectId;

// done
export const createNew = (req, res, next) => {
  var { question } = req.body;

  if(! question) {
    return res.status(422).send({ error: "Question is required" });
  }

  var newQuestion = new SecurityQuestionModel({
    question
  })
  newQuestion.save((err, doc) => {
    if(err) {
      return next(err);
    }
    res.json({
      success: true,
      doc: doc
    });
  })
};

// done
export const update = (req, res, next) => {
  const { question } = req.body;
  const id = req.params.id

  SecurityQuestionModel.findByIdAndUpdate(id, { question: question }, function(err, doc) {
    if(err) {
      return next(err);
    }
    res.json({
      success: true,
      doc: doc
    });
  })
}
// done
export const getAll = (req, res, next) => {

  SecurityQuestionModel.find({}, function(err, docs) {
    if(err) {
      return next(err);
    }
    res.json({
      success: true,
      securityQuestions: docs
    });
  })
}

// done
export const deleteQuestionById = (req, res, next) => {
  const id = req.params.id

  SecurityQuestionModel.deleteOne({_id: id}, function(err, result) {
    if(err) {
      return next(err);
    }
    res.json({
      success: true,
      result: result
    });
  })
}

// done
export const deleteQuestionByIds = async (req, res, next) => {
  // const ids = ['5fbe97269e049239b8fd522b', '5fbe9b0c05f5304f1c2cdaf6', '5fbe9b0f05f5304f1c2cdaf7']
  const ids = req.body.ids;

  if(typeof ids != 'object') {
    return res.status(406).send({ error: "ids should be array of ids" });
  }

  var filterOption = {
    _id: null
  }

  filterOption._id = { $in: ids.map((id) => new ObjectId(id)) };

  SecurityQuestionModel.remove(filterOption, function(err, result) {
    if(err) {
      return next(err);
    }
    res.json({
      success: true,
      result: result
    });
  })
}