'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var path = require('path');
var deleteFile = require('delete');
var Category = require('../models/category').model;
var CategoryPaths = require('../models/category').paths;
var isUsedCategory = require('../models/category').isUsedData;

var _require = require('../helpers/common'),
    filterValidValues = _require.filterValidValues,
    getFilePath = _require.getFilePath,
    matchDownloadUrl = _require.matchDownloadUrl;

var ObjectId = require('mongoose').Types.ObjectId;

var deleteFileByIds = async function deleteFileByIds(ids) {
  var docs = await Category.find({ _id: { $in: ids } });

  docs.forEach(function (doc) {
    if (doc.imgUrl) {
      deleteFile(path.join(__dirname, '../../', doc.imgUrl));
    }
  });
  return true;
};
// const addChild = async function (parenId, childId) {
//   await Category.updateOne({_id: parenId}, { $push: { children: childId } });
//   return true
// }

// const removeSelfInParent = async function (id) {
//   var doc = await Category.findOne({children: { $all: [id] }});
//   if(doc) {
//     await Category.updateOne({_id: doc._id}, { $pull: { children: id } });
//   }
//   return true
// }

/**
 * create new category by admin
 */
var createNew = exports.createNew = async function createNew(req, res, next) {
  // need to upload image
  var newData = filterValidValues(req.body, CategoryPaths);
  // var parentId = req.body.parentId;

  if (req.files[0] && req.files[0].path) {
    newData.imgUrl = getFilePath(req.files[0].path);
  }

  if (!newData.name) {
    if (newData.imgUrl) {
      deleteFile(newData.imgUrl);
    }
    return res.status(422).send({ error: "Name required" });
  }

  var category = await Category.findOne({ name: newData.name });

  if (category) {
    if (newData.imgUrl) {
      deleteFile(newData.imgUrl);
    }
    return res.status(422).send({ error: "Same Category already Exists. Replace name" });
  }

  // if(parentId) {
  //   newData.isParent = false;
  // }

  var newDoc = new Category(newData);

  newDoc.save(function (err, doc) {
    if (err) {
      return next(err);
    }
    // save data
    // if(parentId) {
    //   addChild(parentId, doc._id);
    // }
    res.json({
      success: true,
      doc: doc
    });
  });
};

/**
 * update category
 */
var update = exports.update = async function update(req, res, next) {
  var id = req.params.id;
  var body = filterValidValues(req.body, CategoryPaths);
  var parentId = req.body.parentId;
  if (!body.name) {
    return res.status(422).send({ error: "Name required" });
  }

  if (req.files && req.files[0]) {
    deleteFileByIds([id]); // delete old file
    body.imgUrl = getFilePath(req.files[0].path);
  }

  if (parentId != undefined || parentId != null) {
    body.isParent = true;
  }

  Category.findByIdAndUpdate(id, body, function (err) {
    if (err) {
      return next(err);
    }
    res.json({
      success: true
    });
  });
};

var getAll = exports.getAll = function getAll(req, res, next) {
  var _req$query = req.query,
      page = _req$query.page,
      perPage = _req$query.perPage;


  Category.find({}).populate('children').exec(function (err, docs) {
    if (err) {
      return next(err);
    }
    docs = matchDownloadUrl(docs, 'imgUrl');
    var totalPages = Math.ceil(docs.length / perPage);

    if (page != undefined && perPage != undefined) {
      var calculatedPage = (page - 1) * perPage;
      var calculatedPerPage = page * perPage;

      return res.json({
        success: true,
        categorioes: docs.slice(calculatedPage, calculatedPerPage),
        totalPages: totalPages
      });
    }

    res.json({
      success: true,
      categorioes: docs
    });
  });
};
/**
 * get parent
 * skfslfskd
 */
var getAllParent = exports.getAllParent = function getAllParent(req, res, next) {
  Category.find({ isParent: true }).populate('children').exec(function (err, docs) {
    if (err) {
      return next(err);
    }
    docs = matchDownloadUrl(docs, 'imgUrl');
    res.json({
      success: true,
      parents: docs
    });
  });
};

var deleteById = exports.deleteById = async function deleteById(req, res, next) {
  var id = req.params.id;

  var doc = await Category.findOne({ _id: id });

  if (doc.children && doc.children.length > 0) {
    return res.status(403).send({ error: "Can not delete!. This Category has children!" });
  }
  // check if used
  var isUsed = await isUsedCategory(id);

  if (isUsed) {
    return res.status(403).send({ error: "There are relevant Topics of this Category." });
  }

  await deleteFileByIds([id]);
  // await removeSelfInParent(id)

  Category.remove({ _id: id }, function (err) {
    // delete itself
    if (err) {
      return next(err);
    }
    return res.json({
      success: true
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
  var relatedData = [];
  var nIds = [];
  for (var i in ids) {
    var id = ids[i];

    var isUsed = await isUsedCategory(id);
    if (isUsed) {
      relatedData.push(id);
    } else {
      nIds.push(id);
    }
  }

  filterOption._id = { $in: nIds.map(function (id) {
      return new ObjectId(id);
    }) };
  await deleteFileByIds(nIds);

  Category.remove(filterOption, async function (err, result) {
    if (err) {
      return next(err);
    }

    res.json({
      success: true,
      result: result,
      deletedIds: nIds,
      relatedData: relatedData
    });
  });
};