'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.deleteManyByIds = exports.deleteById = exports.getTopics = exports.update = exports.createNew = undefined;

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var _common = require('../helpers/common');

var TopicModel = require('./../models/topic');
var Roles = require('./../models/role').Roles;

var isUsedTopic = require('./../models/topic').isUsed;

var Topic = TopicModel.model;
var Paths = TopicModel.paths;
var TopicType = TopicModel.TopicType;

async function makeFilter(query) {
  var filter = {
    _id: query._id || null,
    categoryId: query.categoryId || null,
    levelId: query.levelId || null,
    question: query.question || null,
    createdBy: query.createdBy || null
  };

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

var createNew = exports.createNew = async function createNew(req, res, next) {
  var validObj = (0, _common.filterValidValues)(req.body, Paths);

  if (!(0, _common.hasOwnProperties)(validObj, ['name', 'levelId', 'categoryId', 'type'])) {
    return res.status(422).send({ error: "name, level, category requied" });
  }

  validObj = (0, _common.deleteValues)(validObj, ['deleted']);

  var topic = await Topic.findOne({ name: validObj.name, type: validObj.type });

  if (topic) {
    return res.status(422).send({ error: "Already Exists same name. Change the Topic name" });
  }
  validObj.createdBy = req.user._id;

  var newDoc = new Topic(validObj);

  newDoc.save(function (err, doc) {
    if (err) {
      return next(err);
    }
    doc.populate({ path: 'createdBy', select: ['_id', 'firstname', 'lastname'] }, function (err1) {
      if (err1) {
        return next(err1);
      }
      res.json({
        sucess: true,
        doc: doc
      });
    });
  });
};

var update = exports.update = function update(req, res, next) {
  var id = req.params.id;
  var validObj = (0, _common.filterValidValues)(req.body, Paths);

  if (!(0, _common.hasOwnProperties)(validObj, ['name', 'levelId', 'categoryId', 'type'])) {
    return res.status(422).send({ error: "name, level, category requied" });
  }
  Topic.findOneAndUpdate({ _id: id }, {
    name: validObj.name,
    description: validObj.description,
    levelId: validObj.levelId,
    categoryId: validObj.categoryId,
    type: validObj.type
  }, function (err, doc, result) {
    if (err) {
      return next(err);
    }
    res.json({
      sucess: true,
      oldDoc: doc,
      result: result
    });
  });
};

var getTopics = exports.getTopics = async function getTopics(req, res, next) {
  var type = req.query.type;
  var _req$query = req.query,
      page = _req$query.page,
      perPage = _req$query.perPage;


  var filter = await makeFilter(req.query);

  if (type == TopicType.LESSON) {
    filter.type = { $in: [TopicType.LESSON] };
  } else if (type == TopicType.ASSESSMENT) {
    filter.type = { $in: [TopicType.ASSESSMENT] };
  }

  Topic.find(filter).populate({ path: 'categoryId', select: ['_id', 'name'] }).populate({ path: 'levelId', select: ['_id', 'name'] }).populate({ path: 'createdBy', select: ['_id', 'firstname', 'lastname'] }).sort({ createdAt: -1 }).exec(function (err, docs) {
    if (err) {
      return next(err);
    }

    var totalPages = Math.ceil(docs.length / perPage);

    if (page != undefined && perPage != undefined) {
      var calculatedPage = (page - 1) * perPage;
      var calculatedPerPage = page * perPage;

      return res.json({
        topics: docs.slice(calculatedPage, calculatedPerPage),
        totalPages: totalPages
      });
    }

    res.json({
      success: true,
      topics: docs
    });
  });
};
// export const getTopicsForTutor = (req, res, next) => {
//   var type = req.params.type;

// }
/**
 * delete by id
 */
var deleteById = exports.deleteById = async function deleteById(req, res, next) {
  var id = req.params.id;
  var isUsed = await isUsedTopic(id);
  if (isUsed) {
    return res.status(403).send({ error: "This topic has relevant Lesson or Assessmnet." });
  }

  if (req.user.role._id == Roles.admin) {
    Topic.deleteOne({ _id: id }, function (err) {
      if (err) {
        return next(err);
      }

      res.json({
        success: true,
        deletedId: id
      });
    });
  } else {
    Topic.updateOne({ _id: id }, { deleted: true }, function (err) {
      if (err) {
        return next(err);
      }

      res.json({
        success: true,
        deletedId: id
      });
    });
  }
};

/**
 * delete by ids in body
 */
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
    var isUsed = await isUsedTopic(id);
    if (isUsed) {
      usedIds.push(id);
    } else {
      nIds.push(id);
    }
  }

  filterOption._id = { $in: nIds.map(function (id) {
      return id;
    }) };

  Topic.remove(filterOption, function (err, result) {
    if (err) {
      return next(err);
    }
    res.json({
      sucess: true,
      result: result,
      deletedIds: nIds,
      usedIds: usedIds
    });
  });
};