const AssignedModel = require('./../models/assigned');
const Assessment = require('./../models/assessment').model;
const Topic = require('./../models/topic').model;
const Assign = AssignedModel.model;
const Paths = AssignedModel.paths;
import { filterValidValues, hasOwnProperties, matchDownloadUrlByStr, matchDownloadUrl } from '../helpers/common';
import { Roles } from '../models/role';


/**
 * @param {Object} req.query
 * need to implete for topic, categories
 */
async function makeFilter(query) {
  var filter = {
    _id:          query.id || null,
    title:        query.title || null,
    worksheet:    query.worksheet || null,  // worksheetid
    assignedTo:   query.assignedTo || null, // id of user
    updatedAt:    query.updatedAt || null,  // date
    createdBy:    query.createdBy || null,  // id of tutor(usr  table) 
    createdAt:    null
  }

  if(query.title) {
    var rex = RegExp(query.title, 'gi')
    filter.title = { $regex: rex}
  }
  if(query.startTime && query.endTime) {
    filter.createdAt = { $gte: new Date(query.startTime), $lt: new Date(query.endTime)}
  }

  Object.keys(filter).forEach((key) => {
    if(filter[key] == null) {
      delete filter[key]
    }
  });

  return filter;
}

export const assignTask = async (req, res, next) => {
  var validObj = filterValidValues(req.body, Paths);

  if(!hasOwnProperties(validObj, ['title', 'worksheet', 'assignedTo'])) {
    return res.status(422).send({ error: "title, worksheet are required or You didnt select Student" });
  }

  // check already assigned worksheet
  Assign.findOne({
    worksheet: validObj.worksheet, 
    assignedTo: validObj.assignedTo, 
    createdBy: req.user._id
  }, function (err, doc) {
    if(err) { return next(err); }
    if(doc) {
      return res.status(422).send({error: "You are already assigned!"})
    }
    
    var newAssign = new Assign({
      title: validObj.title || "",
      description: validObj.description || "",
      worksheet: validObj.worksheet,
      assignedTo: validObj.assignedTo,
      createdBy: req.user._id
    });
  
    newAssign.save((err1, doc) => {
      if(err1) { return next(err1); }
  
       res.json({
         success: true,
         assign: doc
       });
    })
  })
}

export const updateAssign =  function (req, res, next) {
  var id = req.params.id;

  Assign.findOne({
    _id: {$nin: id},
    worksheet: req.body.worksheet, 
    assignedTo: req.body.assignedTo, 
    createdBy: req.user._id
  }, function (err, doc) {
    if(err) {
      return next(err)
    }
    if(doc) {
      return res.status(422).send({error: "Already Assigned!"})
    }
    Assign.updateOne({_id: id}, {
      title: req.body.title,
      description: req.body.description,
      worksheet: req.body.worksheet
    }, {
      omitUndefined: true
    }, async function (err) {
      if(err) {
        return next(err)
      }
      var doc = await Assign.findOne({_id: id})
        .populate("worksheet")
        .populate("assignedTo")
        .populate("createdBy")
        .populate("answers.assessment")
        .exec();

      res.json({
        success: true,
        assign: doc
      })
    })
  })
}

export const deletAssignedTask = async (req, res, next) => {
  const id = req.params.id;

  if(req.user.role._id == Roles.admin) {
    Assign.deleteOne({_id: id}, function (err, result) {
      if(err) { return next(err) }
      res.json({
        success: true,
        result: result
      });
    })
  } else {
    Assign.deleteOne({_id: id, createdBy: req.user._id}, function (err, result) {
      if(err) { return next(err); }

      res.json({
        success: true,
        result: result
      });
    });
  }
}

export const fetchAssignedTaskForUser = async (req, res, next) => {
  var query = req.query
  query.assignedTo = req.user._id;
  // filter
  var filer = makeFilter(query);

  Assign
    .find(filer)
    .populate("worksheet")
    .populate({
      path: 'assignedTo',
      select: ['_id', 'firstname', 'lastname']
    })
    .populate({
      path: 'createdBy',
      select: ['_id', 'firstname', 'lastname']
    })
    .populate("answers.assessment")
    .exec(function (err, docs) {
      if(err) { return next(err); }
      res.json({
        success: true,
        assignedTasks: docs
      });
    })
}

export const makeMark = async (req, res, next) => {
  const id = req.params.id;
  var mark = req.body.mark;

  Assessment.findOneAndUpdate({_id: id, createdBy: req.user._id}, {mark: mark}, function (err, doc, result) {
    if(err) { return next(err); }

    res.json({
      success: true,
      result
    });
  })
}

export const updateAnswer = async (req, res, next) => {
  const id = req.params.id;
  const {answerVoice, answerText, selectedMCQIndex} = req.body

  Assign
    .findOneAndUpdate(
      {_id: id, assignedTo: req.user._id}, 
      {answerVoice, answerText, selectedMCQIndex },
      {omitUndefined: false},
      function (err,doc, result) {
        if(err) { return next(err); }
        res.json({
          success: true,
          result
        });
      })
}

export const fetchAssignedListByFilter = async (req, res, next) => {
  var query = req.query;
  var filter = await makeFilter(query);
  
  Assign
    .find(filter)
    .populate({
      path: 'worksheet',
      model: "worksheet",
      populate: {
        path: 'assessments',
        model: "assessment"
      }
    })
    .populate({
      path: 'assignedTo',
      select: ['_id', 'firstname', 'lastname']
    })
    .populate({
      path: 'createdBy',
      select: ['_id', 'firstname', 'lastname']
    })
    .populate("answers.assessment")
    .exec((err, docs) => {
      if(err) {
        return next(error)
      }
      matchDownloadUrl
      docs = docs.map((doc) => {
        if(doc.answers && doc.answers.length > 0) {
          doc.answers = doc.answers.map((answer) => {
            if(answer.voiceUrl) {
              answer.voiceUrl = matchDownloadUrlByStr(answer.voiceUrl)
            }
            return answer
          })
        }
        return doc
      })

      res.json({
        success: true,
        assignedList: docs
      });
    })
}