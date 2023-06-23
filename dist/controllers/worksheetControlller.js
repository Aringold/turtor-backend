'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.deleteWorkSheetMany = exports.deleteWorkSheet = exports.updateWorkSheet = exports.fetchDataByQuery = exports.fetchAll = undefined;

var _common = require('../helpers/common');

var _role = require('../models/role');

var Worksheet = require('../models/worksheet').model;
var Paths = require('../models/worksheet').paths;
var isUsedWorkSheet = require('../models/worksheet').isUsedWorkSheet;


async function makeFilter(query) {
  var filter = {
    _id: query._id || null,
    createdBy: query.createdBy || null
  };

  if (query.name) {
    var reg = RegExp(query.name, 'gi');
    filter.name = { $regex: reg };
  }

  Object.keys(filter).forEach(function (key) {
    if (filter[key] == null) {
      delete filter[key];
    }
  });

  return filter;
}

// export const insertWorkSheet = async (req, res, next) => {
//   var validObj = filterValidValues(req.body, Paths);

//   if(! hasOwnProperties(validObj, ['name', 'assessments', 'topicId'])) {
//     return res.status(422).send({ error: "name, questions or topic are required!" });
//   }

//   validObj.createdBy = req.user._id;

//   var newDoc = new Worksheet(validObj);
//   newDoc.save((err, doc) => {
//     if(err) { 
//       return next(err); 
//     }

//     res.json({
//       success: true,
//       doc
//     });
//   })
// }

var fetchAll = exports.fetchAll = async function fetchAll(req, res, next) {
  var _req$query = req.query,
      page = _req$query.page,
      perPage = _req$query.perPage;


  var filterOption = await makeFilter(req.query);

  Worksheet.find(filterOption).populate({
    path: 'createdBy',
    select: ['_id', 'firstname', 'lastname']
  }).populate('topicId').exec(function (err, docs) {
    if (err) {
      return next(err);
    }

    var totalPages = Math.ceil(docs.length / perPage);

    if (page != undefined && perPage != undefined) {
      var calculatedPage = (page - 1) * perPage;
      var calculatedPerPage = page * perPage;

      return res.json({
        worksheets: docs.slice(calculatedPage, calculatedPerPage),
        totalPages: totalPages
      });
    }
    res.json({
      success: true,
      worksheets: docs
    });
  });
};

var fetchDataByQuery = exports.fetchDataByQuery = async function fetchDataByQuery(req, res, next) {
  var _req$query2 = req.query,
      start = _req$query2.start,
      end = _req$query2.end; // optional for smart rendering.

  var filterOption = await makeFilter(req.query);

  Worksheet.find(filterOption).populate({
    path: 'createdBy',
    select: ['_id', 'firstname', 'lastname']
  }).populate('topicId').exec(function (err, docs) {
    if (err) {
      return next(err);
    }

    res.json({
      success: true,
      worksheets: docs
    });
  });
};

var updateWorkSheet = exports.updateWorkSheet = async function updateWorkSheet(req, res, next) {
  var id = req.params.id;
  if (id == null || id == "") {
    return res.status(422).send({
      error: "id parameter is required"
    });
  }

  if (req.body.name == '' || !req.body.assessments || req.body.assessments.length == 0) {
    return res.status(422).send({
      error: "name or questions required"
    });
  }
  var condition = {
    _id: id
  };
  if (req.user.role._id != _role.Roles.admin) {
    condition.createdBy = req.user._id;
  }

  Worksheet.findOneAndUpdate(condition, {
    topicId: req.body.topicId,
    name: req.body.name,
    assessments: req.body.assessments
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

var deleteWorkSheet = exports.deleteWorkSheet = async function deleteWorkSheet(req, res, next) {
  var id = req.params.id;

  if (!id) {
    res.status(422).send({ error: "Id parameter required" });
  }

  var AssignedTask = await isUsedWorkSheet(id);
  if (AssignedTask) {
    return res.status(403).send({ error: "This WorkSheet was Assgined" });
  }
  var condition = {
    _id: id
  };
  if (req.user.role._id != _role.Roles.admin) {
    condition.createdBy = req.user._id;
  }

  Worksheet.deleteOne(condition, function (err, result) {
    if (err) {
      return next(err);
    }

    res.json({
      success: true,
      result: result
    });
  });
};

var deleteWorkSheetMany = exports.deleteWorkSheetMany = async function deleteWorkSheetMany(req, res, next) {
  var ids = req.body.ids;

  if (!ids || ids.length == 0) {
    res.status(422).send({ error: "ids required" });
  }

  var nIds = [];
  var usedIds = [];

  for (var i in ids) {
    var id = ids[i];
    var AssignedTask = await isUsedWorkSheet(id);
    if (AssignedTask) {
      usedIds.push(id);
    } else {
      nIds.push(id);
    }
  }

  var condition = {
    _id: {
      $in: nIds
    }
  };

  if (req.user.role._id != _role.Roles.admin) {
    condition.createdBy = req.user._id;
  }

  Worksheet.remove(condition, function (err, result) {
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