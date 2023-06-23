'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.changeStatus = exports.deleteByIds = exports.deleteById = exports.fetchlessonById = exports.fetchAllLessons = exports.update = exports.createNew = exports.checkLessonName = undefined;

var _common = require('../helpers/common');

var deleteFile = require('delete');
var path = require('path');
var LessonModel = require('./../models/lesson');
var CategoryModel = require('./../models/category').model;
var Roles = require('./../models/role').Roles;
var TopicModel = require('./../models/topic').model;
var Lesson = LessonModel.model;
var Paths = LessonModel.paths;
var Status = LessonModel.Status;


async function makeFilter(query) {
  var filter = {
    _id: query.id || null,
    level: query.level || null,
    topic: query.topic || null,
    isTopLesson: query.isTopLesson || null,
    createdBy: query.createdBy || null,
    status: query.status || null
  };

  if (query.categories) {
    var categories = await CategoryModel.find({ _id: { $in: query.categories } });
    var ids = [];
    categories.forEach(function (category) {
      ids.push(category._id);
    });
    var topics = await TopicModel.find({ categoryId: { $in: ids } });

    var topicIds = [];
    topics.forEach(function (topic) {
      topicIds.push(topic._id);
    });
    if (filter.topic) {
      filter.topic = { $in: [filter.topic].concat(topicIds) };
    } else {
      filter.topic = { $in: topicIds };
    }
  }

  if (query.name) {
    var rex = RegExp(query.name, 'gi');
    filter.name = { $regex: rex };
  }

  Object.keys(filter).forEach(function (key) {
    if (filter[key] == null) {
      delete filter[key];
    }
  });

  return filter;
}

var deleteImgFileByIds = async function deleteImgFileByIds(ids) {
  var docs = await Lesson.find({ _id: { $in: ids } });
  docs.forEach(function (doc) {
    if (doc.imgUrl) {
      deleteFile(path.join(__dirname, '../../', doc.imgUrl));
    }
  });
  return true;
};

var deleteVideoFileByIds = async function deleteVideoFileByIds(ids) {
  var docs = await Lesson.find({ _id: { $in: ids } });
  docs.forEach(function (doc) {
    if (doc.videos && doc.videos[0]) {
      deleteFile(path.join(__dirname, '../../', doc.videos[0]));
    }
  });
  return true;
};

var deleteReqFiles = function deleteReqFiles(req) {
  if (req.files && req.files.length > 0) {

    for (var i in req.files) {
      var file = req.files[i];
      deleteFile(file.path);
    }
  }
};

var checkLessonName = exports.checkLessonName = async function checkLessonName(req, res, next) {
  if (!req.body.name) {
    deleteReqFiles(req);
    return res.status(422).send({ error: "Required name" });
  }
  var condition = {
    name: req.body.name
  };
  if (req.params.id) {
    condition._id = {
      $nin: req.params.id
    };
  }
  var existsLesson = await Lesson.findOne(condition);
  if (existsLesson) {
    deleteReqFiles(req);
    return res.status(422).send({ error: "Same Lesson Already Exits" });
  }
  return next(null, true);
};
/**
 * create new
 */
var createNew = exports.createNew = async function createNew(req, res, next) {
  var validObj = (0, _common.filterValidValues)(req.body, Paths);

  if (validObj.learnkeys) {
    validObj.learnkeys = JSON.parse(validObj.learnkeys);
  }

  if (req.files && req.files.length > 0) {

    for (var i in req.files) {
      var file = req.files[i];

      if (file.fieldname == 'videos') {
        validObj.videos = (0, _common.getFilePath)(file.path);
      }

      if (file.fieldname == 'image') {
        validObj.imgUrl = (0, _common.getFilePath)(file.path);
      }
    }
  }

  if (!(0, _common.hasOwnProperties)(validObj, ['name', 'learnkeys', 'level', 'topic', 'imgUrl'])) {
    deleteReqFiles(req);
    return res.status(422).send({ error: "name, level, topic, image or learnkeys" });
  }

  validObj.createdBy = req.user._id;
  validObj.status = 1;

  var newDoc = new Lesson(validObj);
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
  var validObj = (0, _common.filterValidValues)(req.body, Paths);
  if (!(0, _common.hasOwnProperties)(validObj, ['name', 'level', 'topic'])) {
    deleteReqFiles(req);
    return res.status(422).send({ error: "name, level, topic or learnkeys" });
  }
  delete validObj.status;

  if (req.files && req.files.length > 0) {

    for (var i in req.files) {
      var file = req.files[i];

      if (file.fieldname == 'videos') {
        deleteVideoFileByIds([id]);
        validObj.videos = (0, _common.getFilePath)(file.path);
      }

      if (file.fieldname == 'image') {
        deleteImgFileByIds([id]);
        validObj.imgUrl = (0, _common.getFilePath)(file.path);
      }
    }
  }

  if (validObj.learnkeys) {
    validObj.learnkeys = JSON.parse(validObj.learnkeys);
  }

  var condition = {
    _id: id
  };

  if (req.user.role._id != Roles.admin) {
    condition.createdBy = req.user._id;
  }

  Lesson.updateOne(condition, validObj, function (err, doc) {
    if (err) {
      return next(err);
    }

    res.json({
      success: true,
      doc: doc
    });
  });
};

var fetchAllLessons = exports.fetchAllLessons = async function fetchAllLessons(req, res, next) {
  var _req$query = req.query,
      page = _req$query.page,
      perPage = _req$query.perPage;


  var filter = await makeFilter(req.query);
  // filter.status = 1; // only for accepted by admin
  Lesson.find(filter).populate('level').populate({
    path: 'topic',
    model: 'topic',
    populate: {
      path: 'categoryId',
      model: 'category'
    }
  }).populate({
    path: 'createdBy',
    select: ['_id', 'firstname', 'lastname']
  }).exec(function (err, docs) {
    if (err) {
      return next(err);
    }

    docs = (0, _common.matchDownloadUrl)(docs, 'imgUrl');
    docs = docs.map(function (doc) {
      if (doc.videos[0] != '') {
        doc.videos[0] = (0, _common.matchDownloadUrlByStr)(doc.videos[0]);
      }
      return doc;
    });

    var totalPages = Math.ceil(docs.length / perPage);

    if (page != undefined && perPage != undefined) {
      var calculatedPage = (page - 1) * perPage;
      var calculatedPerPage = page * perPage;

      return res.json({
        lessons: docs.slice(calculatedPage, calculatedPerPage),
        totalPages: totalPages
      });
    }

    res.json({
      success: true,
      lessons: docs
    });
  });
};
var fetchlessonById = exports.fetchlessonById = async function fetchlessonById(req, res, next) {
  var id = req.params.id;
  if (!id) {
    res.status(403).send({ error: "id param required" });
  }
  Lesson.findOne({ _id: id }).populate('level').populate({
    path: 'topic',
    model: 'topic',
    populate: {
      path: 'categoryId',
      model: 'category'
    }
  }).populate({
    path: 'createdBy',
    select: ['_id', 'firstname', 'lastname']
  }).exec(function (err, doc) {
    if (err) {
      return next(err);
    }

    if (doc.imgUrl) {
      doc.imgUrl = (0, _common.matchDownloadUrlByStr)(doc.imgUrl);
    }
    if (doc.videos && doc.videos[0]) {
      doc.videos[0] = (0, _common.matchDownloadUrlByStr)(doc.videos[0]);
    }

    res.json({
      success: true,
      lesson: doc
    });
  });
};

// export const fetchAllLessons = async (req, res, next) => {
//   var filter = await makeFilter({createdBy: req.user._id })
//   Lesson.find(filter , function (err, docs) {
//     if(err) { return next(err); }
//     docs = matchDownloadUrl(docs, 'imgUrl');
//     res.json({
//       success: true,
//       lessons: docs
//     });
//   });
// }

var deleteById = exports.deleteById = async function deleteById(req, res, next) {
  var id = req.params.id;
  await deleteImgFileByIds([id]);
  await deleteVideoFileByIds([id]);
  if (req.user.role._id == Roles.admin) {
    Lesson.deleteOne({ _id: id }, function (err, result) {
      if (err) {
        return next(err);
      }
      res.json({
        success: true,
        result: result
      });
    });
  } else {
    Lesson.deleteOne({ _id: id, createdBy: req.user._id }, function (err, result) {
      if (err) {
        return next(err);
      }
      res.json({
        success: true,
        result: result
      });
    });
  }
};

var deleteByIds = exports.deleteByIds = async function deleteByIds(req, res, next) {
  var ids = req.body.ids;

  await deleteImgFileByIds(ids);
  await deleteVideoFileByIds(ids);

  if (req.user.role._id == Roles.admin) {
    Lesson.deleteMany({ _id: { $in: ids } }, function (err, result) {
      if (err) {
        return next(err);
      }

      res.json({
        success: true,
        result: result
      });
    });
  } else {
    Lesson.deleteMany({ _id: { $in: ids }, createdBy: req.user._id }, function (err, result) {
      if (err) {
        return next(err);
      }

      res.json({
        success: true,
        result: result
      });
    });
  }
};

var changeStatus = exports.changeStatus = function changeStatus(req, res, next) {
  var id = req.params.id;
  var type = req.body.status;

  var status = 0;
  // pending 0 | accepted 1 | denied 2 |
  if (type == Status.accepted) {
    status = 1;
  } else if (type == Status.denied) {
    status = 2;
  } else if (type == Status.pending) {
    status = 0;
  } else {
    return res.status(422).send({ error: "Type is incorrect" });
  }

  Lesson.updateOne({ _id: id }, { status: status }, function (err) {
    if (err) {
      return next(err);
    }

    res.json({
      success: true,
      status: status
    });
  });
};