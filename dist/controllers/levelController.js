'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.deleteManyByIds = exports.deleteById = exports.getAll = exports.update = exports.createNew = undefined;

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var _common = require('../helpers/common');

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var deleteFile = require('delete');
var LevelModel = require('../models/level').model;
var isUsedLevel = require('../models/level').isUsed;
var ObjectId = require('mongoose').Types.ObjectId;

var checkNameExists = async function checkNameExists(name) {
  var doc = await LevelModel.find({ name: name }).then(doc);
  return doc.length > 0;
};

var deleteFileByIds = async function deleteFileByIds(ids) {
  var docs = await LevelModel.find({ _id: { $in: ids } });
  docs.forEach(function (doc) {
    if (doc.imgUrl != "" && doc.imgUrl) {
      deleteFile(_path2.default.join(__dirname, '../../', doc.imgUrl));
    }
  });
  return true;
};

// done
var createNew = exports.createNew = async function createNew(req, res, next) {
  var validDoc = (0, _common.filterValidValues)(req.body, ['name', 'description', 'iconClassName', 'imgUrl']);

  var doc = await checkNameExists(validDoc.name);
  if (validDoc.name == '' || doc) {
    deleteFile(req.files[0] && req.files[0].path);
    return res.status(422).send({ error: 'Same name already exists!' });
  }
  if (req.files && req.files[0]) {
    validDoc.imgUrl = (0, _common.getFilePath)(req.files[0].path);
  }
  var newDoc = new LevelModel(validDoc);

  newDoc.save(function (err, doc) {
    if (err) {
      return next(err);
    }
    res.json({
      success: true,
      doc: doc
    });
  });
};

// done
var update = exports.update = async function update(req, res, next) {
  var id = req.params.id;

  var validDoc = (0, _common.filterValidValues)(req.body, ['name', 'description', 'iconClassName', 'imgUrl']);
  var docs = await LevelModel.find({ name: validDoc.name, _id: { $ne: id } });
  if (docs.length > 0) {
    return res.status(422).send({ error: 'Same name already exists!' });
  }
  if (req.files && req.files[0]) {
    await deleteFileByIds([id]);
    validDoc.imgUrl = (0, _common.getFilePath)(req.files[0].path);
  }

  LevelModel.findByIdAndUpdate(id, validDoc, function (err, doc) {
    if (err) {
      return next(err);
    }
    res.json({
      success: true,
      oldDoc: doc
    });
  });
};

// done
var getAll = exports.getAll = function getAll(req, res, next) {
  var _req$query = req.query,
      page = _req$query.page,
      perPage = _req$query.perPage;


  LevelModel.find({}, function (err, docs) {
    if (err) {
      return next(err);
    }
    docs = (0, _common.matchDownloadUrl)(docs, 'imgUrl');

    var totalPages = Math.ceil(docs.length / perPage);

    if (page != undefined && perPage != undefined) {
      var calculatedPage = (page - 1) * perPage;
      var calculatedPerPage = page * perPage;

      return res.json({
        levels: docs.slice(calculatedPage, calculatedPerPage),
        totalPages: totalPages
      });
    }
    res.json({
      success: true,
      levels: docs
    });
  });
};
// done
var deleteById = exports.deleteById = async function deleteById(req, res, next) {
  var id = req.params.id;
  var isUsed = await isUsedLevel(id);
  if (isUsed) {
    return res.status(406).send({ error: "There is relevant data of this level." });
  }

  await deleteFileByIds([id]);

  LevelModel.deleteOne({ _id: id }, async function (err, result) {
    if (err) {
      return next(err);
    }

    res.json({
      success: true,
      result: result
    });
  });
};

// done
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

    var isUsed = await isUsedLevel(id);
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

  LevelModel.remove(filterOption, async function (err, result) {
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