'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.deleteManyByIds = exports.removeAssessment = exports.fetchAssessmentByFilter = exports.fetchAllAssessment = exports.update = exports.insertAssessment = undefined;

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var _common = require('../helpers/common');

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

var ObjectId = require('mongoose').Types.ObjectId;

var deleteFile = require('delete');
var path = require('path');
var AssessmentModel = require('./../models/assessment');
var Assessment = AssessmentModel.model;
var Paths = AssessmentModel.paths;
var isUsedAssessment = AssessmentModel.isUsed;
var Topic = require('./../models/topic').model;
var ROLES = require('./../models/role').Roles;

async function makeFilter(query) {
  var filter = {
    _id: query._id || null,
    topic: query.topic || null,
    level: query.level || null,
    question: query.question || null,
    isMCQ: query.isMCQ || null,
    createdBy: query.createdBy ? new ObjectId(query.createdBy) : null,
    deleted: query.deleted || null
  };

  if (query.question) {
    var rex = RegExp(query.question, 'gi');
    filter.question = { $regex: rex };
  }
  if (query.description) {
    var descReg = RegExp(query.description, 'gi');
    filter.description = { $regex: descReg };
  }
  if (query.categories) {
    var topics = await Topic.find({ categoryId: { $in: query.categories } });
    if (topics.length > 0) {
      var topicIds = [];
      topicIds = topics.map(function (topic) {
        return topic._id;
      });
      if (filter.topic) {
        filter.topic = { $in: [].concat(_toConsumableArray(topicIds), [filterConfition.topic]) };
      } else {
        filter.topic = { $in: topicIds };
      }
    }
  }

  Object.keys(filter).forEach(function (key) {
    if (filter[key] == null) {
      delete filter[key];
    }
  });

  console.log('-----------111------------------');
  console.log(filter);
  console.log('-----------------------------');

  return filter;
}

var deleteReqFiles = function deleteReqFiles(req) {
  if (req.files && req.files.length > 0) {

    for (var i in req.files) {
      var file = req.files[i];
      deleteFile(file.path);
    }
  }
};

var deleteImgFileByIds = async function deleteImgFileByIds(ids) {
  var docs = await Assessment.find({ _id: { $in: ids } });
  docs.forEach(function (doc) {
    if (doc.imgUrl) {
      deleteFile(path.join(__dirname, '../../', doc.imgUrl));
    }
  });
  return true;
};

var deleteVideoFileByIds = async function deleteVideoFileByIds(ids) {
  var docs = await Assessment.find({ _id: { $in: ids } });
  docs.forEach(function (doc) {
    if (doc.videos[0]) {
      deleteFile(path.join(__dirname, '../../', doc.videos[0]));
    }
  });
  return true;
};

var getAssessments = async function getAssessments(filter) {
  if (!filter) {
    filter = {};
  }
  var docs = await Assessment.find(filter).populate({
    path: 'topic',
    model: 'topic',
    populate: {
      path: 'categoryId',
      model: 'category'
    }
  }).populate('level').populate({
    path: 'createdBy',
    select: ['_id', 'firstname', 'lastname']
  }).exec();
  docs = (0, _common.matchDownloadUrl)(docs, 'imgUrl');
  docs = docs.map(function (doc) {
    if (doc.videos && doc.videos[0]) {
      doc.videos[0] = (0, _common.matchDownloadUrlByStr)(doc.videos[0]);
    }
    return doc;
  });
  return docs;
};

var insertAssessment = exports.insertAssessment = async function insertAssessment(req, res, next) {
  var validObj = (0, _common.filterValidValues)(req.body, ['topic', 'mark', 'description', 'youtubeUrl', 'isMCQ', 'tags', 'deleted', 'MCQs', 'question', 'level']);

  if (!(0, _common.hasOwnProperties)(validObj, ['topic', 'level', "question"])) {
    deleteReqFiles(req);
    return res.status(422).send({ error: "topic, question and level are required" });
  }

  if (validObj.MCQs) {
    validObj.MCQs = JSON.parse(validObj.MCQs);
  }

  if (req.files && req.files.length > 0) {
    for (var i in req.files) {
      var file = req.files[i];

      if (file.fieldname == 'videos') {
        if (file.path) {
          validObj.videos = (0, _common.getFilePath)(file.path);
        }
      }

      if (file.fieldname == 'image') {
        if (file.path) {
          validObj.imgUrl = (0, _common.getFilePath)(file.path);
        }
      }
    }
  }

  validObj.createdBy = req.user._id;
  var newDoc = new Assessment(validObj);
  newDoc.save(function (err, doc) {
    if (err) {
      deleteReqFiles(req);
      return next(err);
    }

    res.json({
      success: true,
      doc: doc
    });
  });
};

var update = exports.update = async function update(req, res, next) {
  var id = req.params.id;
  var validObj = (0, _common.filterValidValues)(req.body, ['topic', 'mark', 'description', 'youtubeUrl', 'isMCQ', 'tags', 'deleted', 'MCQs', 'question', 'level']);

  if (!(0, _common.hasOwnProperties)(validObj, ['topic', 'level', "question"])) {
    await deleteReqFiles(req);
    return res.status(422).send({ error: "topic, question and level are required" });
  }

  if (validObj.MCQs) {
    validObj.MCQs = JSON.parse(validObj.MCQs);
  }

  if (req.files && req.files.length > 0) {
    for (var i in req.files) {
      var file = req.files[i];

      if (file.fieldname == 'videos') {
        await deleteVideoFileByIds([id]);
        validObj.videos = (0, _common.getFilePath)(file.path);
      }

      if (file.fieldname == 'image') {
        await deleteImgFileByIds([id]);
        validObj.imgUrl = (0, _common.getFilePath)(file.path);
      }
    }
  }

  var condition = {
    _id: id
  };

  if (req.user.role._id != ROLES.admin) {
    condition.createdBy = req.user._id;
  }

  Assessment.findOneAndUpdate(condition, validObj, {
    omitUndefined: true
  }, function (err, doc, result) {
    if (err) {
      deleteReqFiles(req);
      return next(err);
    }
    res.json({
      success: true,
      oldDoc: doc,
      result: result
    });
  });
};

/**
 * only datas
 */
var fetchAllAssessment = exports.fetchAllAssessment = async function fetchAllAssessment(req, res, next) {
  var query = req.query;
  var _req$query = req.query,
      page = _req$query.page,
      perPage = _req$query.perPage;


  if (ROLES.admin != req.user.role._id) {
    query.createdBy = req.user._id;
  }

  var filter = await makeFilter(query);
  var docs = await getAssessments(filter).catch(function (error) {
    next(error);
  });

  var totalPages = Math.ceil(docs.length / perPage);

  if (page != undefined && perPage != undefined) {
    var calculatedPage = (page - 1) * perPage;
    var calculatedPerPage = page * perPage;

    return res.json({
      assessments: docs.slice(calculatedPage, calculatedPerPage),
      totalPages: totalPages
    });
  }
  res.json({
    success: true,
    assessments: docs
  });
};

var fetchAssessmentByFilter = exports.fetchAssessmentByFilter = async function fetchAssessmentByFilter(req, res, next) {
  var query = req.query;
  var filter = await makeFilter(query);
  var docs = await getAssessments(filter).catch(function (error) {
    next(error);
  });

  if (query.category) {
    docs = docs.filter(function (doc) {
      return doc.topic.categoryId._id == query.category;
    });
  }

  res.json({
    success: true,
    assessments: docs
  });
};

// export const fetchAssessmentByFilterForUser = async (req, res, next) => {
//   var query = req.query;
//   var filter = await makeFilter(query);
//   var docs = await getAssessments(filter).catch((error) => {
//     next(error)
//   });

//   if(query.category) {
//     docs = docs.filter((doc) =>
//       doc.topic.categoryId._id == query.category
//     )
//   }
//   docs = docs.map((doc) =>{
//     if(doc.MCQs && doc.MCQs.length > 0) {
//       doc.MCQs = doc.MCQs.map((item) => ({index: item.index, text: item.text}));
//     }
//     return doc
//   })

//   res.json({
//     success: true,
//     assessments: docs
//   });
// }

var removeAssessment = exports.removeAssessment = async function removeAssessment(req, res, next) {
  var id = req.params.id;

  var isUsed = await isUsedAssessment(id);
  if (isUsed) {
    return res.status(403).send({ error: 'This question have relevant worksheet data.\n first remove this question from the worksheet!' });
  }

  await deleteImgFileByIds([id]);
  await deleteVideoFileByIds([id]);

  var condition = {
    _id: id
  };
  if (req.user.role._id != ROLES.admin) {
    condition.createdBy = req.user._id;
  }

  Assessment.deleteOne(condition, function (err, result) {
    if (err) {
      return next(err);
    }

    res.json({
      success: true,
      result: result
    });
  });
};

var deleteManyByIds = exports.deleteManyByIds = async function deleteManyByIds(req, res, next) {
  var ids = req.body.ids;

  if ((typeof ids === 'undefined' ? 'undefined' : _typeof(ids)) != 'object') {
    return res.status(406).send({ error: "ids should be array of ids" });
  }

  var filterOption = {
    _id: null
  };
  var usedIds = [];
  var nIds = [];

  for (var i in ids) {
    var id = ids[i];

    var isUsed = isUsedAssessment(id);
    if (isUsed) {
      usedIds.push(id);
    } else {
      nIds.push(id);
    }
  }

  filterOption._id = { $in: nIds.map(function (id) {
      return id;
    }) };

  if (req.user.role._id !== ROLES.admin) {
    filterOption.createdBy = req.user._id;
  }

  await deleteImgFileByIds(nIds);
  await deleteVideoFileByIds(nIds);

  Assessment.remove(filterOption, function (err, result) {
    if (err) {
      return next(err);
    }

    res.json({
      success: true,
      result: result,
      deletedIds: nIds,
      relatedData: usedIds
    });
  });
};