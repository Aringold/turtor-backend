const {ObjectId}        = require('mongoose').Types
const deleteFile        = require('delete');
const path              = require('path');
const AssessmentModel   = require('./../models/assessment');
const Assessment        = AssessmentModel.model;
const Paths             = AssessmentModel.paths;
const isUsedAssessment  = AssessmentModel.isUsed;
const Topic             = require('./../models/topic').model;
const ROLES             = require('./../models/role').Roles;

import {
  filterValidValues,
  hasOwnProperties,
  deleteValues,
  getFilePath,
  matchDownloadUrl,
  matchDownloadUrlByStr
} from '../helpers/common';

async function makeFilter(query) {
  var filter = {
    _id:          query._id || null,
    topic:        query.topic || null,
    level:        query.level || null,
    question:     query.question || null,
    isMCQ:        query.isMCQ || null,
    createdBy:    query.createdBy ? new ObjectId(query.createdBy) : null,
    deleted:      query.deleted || null,
  }
  
  if(query.question) {
    var rex = RegExp(query.question, 'gi')
    filter.question = { $regex: rex}
  }
  if(query.description) {
    var descReg = RegExp(query.description, 'gi')
    filter.description = { $regex: descReg}
  }
  if(query.categories) {
    var topics = await Topic.find({categoryId: {$in: query.categories}});
    if(topics.length > 0) {
      var topicIds = [];
      topicIds = topics.map((topic) => (topic._id));
      if(filter.topic) {
        filter.topic = {$in: [...topicIds, filterConfition.topic]}
      } else {
        filter.topic = {$in: topicIds}
      }
    }
  }
 
  Object.keys(filter).forEach((key) => {
    if(filter[key] == null) {
      delete filter[key]
    }
  });

  console.log('-----------111------------------');
  console.log(filter);
  console.log('-----------------------------');

  return filter;
}

const deleteReqFiles = function(req) {
  if(req.files && req.files.length > 0) {
    
    for (const i in req.files) {
      var file = req.files[i];
      deleteFile(file.path);
    }
  }
}

const deleteImgFileByIds = async function (ids) {
  var docs = await Assessment.find({_id: { $in: ids }});
  docs.forEach((doc) => {
    if(doc.imgUrl) {
      deleteFile(path.join(__dirname, '../../', doc.imgUrl))
    }
  })
  return true
}

const deleteVideoFileByIds = async function (ids) {
  var docs = await Assessment.find({_id: { $in: ids }});
  docs.forEach((doc) => {
    if(doc.videos[0]) {
      deleteFile(path.join(__dirname, '../../', doc.videos[0]))
    }
  })
  return true
}

const getAssessments = async function (filter) {
  if(!filter) {
    filter = {}
  }
  let docs = 
    await  Assessment
      .find(filter)
      .populate({
        path: 'topic',
        model: 'topic',
        populate: {
          path: 'categoryId',
          model: 'category'
        },
      })
      .populate('level')
      .populate({
        path: 'createdBy',
        select: ['_id', 'firstname', 'lastname']
      })
      .exec();
  docs = matchDownloadUrl(docs, 'imgUrl');
  docs = docs.map((doc) => {
    if(doc.videos && doc.videos[0]) {
      doc.videos[0]  = matchDownloadUrlByStr(doc.videos[0])
    }
    return doc
  })
  return docs
}

export const insertAssessment = async (req, res, next) => {
  var validObj = filterValidValues(req.body, ['topic', 'mark', 'description', 'youtubeUrl', 'isMCQ', 'tags', 'deleted', 'MCQs', 'question', 'level' ]);

  if(! hasOwnProperties(validObj, ['topic', 'level', "question" ])) {
    deleteReqFiles(req);
    return res.status(422).send({ error: "topic, question and level are required" });
  }

  if(validObj.MCQs) {
    validObj.MCQs = JSON.parse(validObj.MCQs);
  }

  if(req.files && req.files.length > 0) {
    for (const i in req.files) {
      var file = req.files[i];

      if (file.fieldname == 'videos') {
        if(file.path) {
          validObj.videos = getFilePath(file.path);
        }
      }

      if (file.fieldname == 'image') {
        if(file.path) {
          validObj.imgUrl = getFilePath(file.path);
        }
      }
    }
  }

  validObj.createdBy = req.user._id;
  var newDoc = new Assessment(validObj);
  newDoc.save((err, doc) => {
    if(err) { 
      deleteReqFiles(req);
      return next(err); 
    }

     res.json({
       success: true,
       doc
     });
  })
}

export const update = async (req, res, next) => {
  const id = req.params.id
  var validObj = filterValidValues(req.body, 
      ['topic', 'mark', 'description', 'youtubeUrl', 'isMCQ', 'tags', 'deleted', 'MCQs', 'question', 'level' ]
    );

  if(! hasOwnProperties(validObj, ['topic', 'level', "question" ])) {
    await deleteReqFiles(req);
    return res.status(422).send({ error: "topic, question and level are required" });
  }

  if(validObj.MCQs) {
    validObj.MCQs = JSON.parse(validObj.MCQs);
  }

  if(req.files && req.files.length > 0) {
    for (const i in req.files) {
      var file = req.files[i];

      if (file.fieldname == 'videos') {
        await deleteVideoFileByIds([id]);
        validObj.videos = getFilePath(file.path);
      }

      if (file.fieldname == 'image') {
        await deleteImgFileByIds([id])
        validObj.imgUrl = getFilePath(file.path);
      }
    }
  }

  var condition = {
    _id: id,
  }

  if(req.user.role._id != ROLES.admin) {
    condition.createdBy = req.user._id
  }

  Assessment.findOneAndUpdate(condition,
    validObj,
    {
      omitUndefined: true
    },
    function (err, doc, result) {
      if(err) { 
        deleteReqFiles(req);
        return next(err); 
      }
      res.json({
        success: true,
        oldDoc: doc,
        result
      });
    })
}

/**
 * only datas
 */
export const fetchAllAssessment = async (req, res, next) => {
  var query = req.query;
  const { page, perPage } = req.query;

  if(ROLES.admin != req.user.role._id) {
    query.createdBy  = req.user._id
  }

  var filter = await makeFilter(query);
  var docs = await getAssessments(filter).catch((error) => {
    next(error)
  })

  let totalPages = Math.ceil(docs.length / perPage)

  if (page != undefined && perPage != undefined) {
    let calculatedPage = (page - 1) * perPage;
    let calculatedPerPage = page * perPage;

    return  res.json({
      assessments: docs.slice(calculatedPage, calculatedPerPage),
      totalPages,
    });
  }
  res.json({
    success: true,
    assessments: docs
  });
}

export const fetchAssessmentByFilter = async (req, res, next) => {
  var query = req.query;
  var filter = await makeFilter(query);
  var docs = await getAssessments(filter).catch((error) => {
    next(error)
  });

  if(query.category) {
    docs = docs.filter((doc) =>
      doc.topic.categoryId._id == query.category
    )
  }

   res.json({
    success: true,
    assessments: docs
   });
}

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

export const removeAssessment = async (req, res, next) => {
  const id = req.params.id;

  var isUsed = await isUsedAssessment(id);
  if(isUsed) {
    return res.status(403).send({error: 'This question have relevant worksheet data.\n first remove this question from the worksheet!'});
  }

  await deleteImgFileByIds([id]);
  await deleteVideoFileByIds([id]);

  var condition = {
    _id: id
  }
  if(req.user.role._id != ROLES.admin) {
    condition.createdBy = req.user._id
  }

  Assessment.deleteOne(condition, function (err, result) {
    if(err) { return next(err); }
    
     res.json({
       success: true,
       result: result
     });
  })
}

export const deleteManyByIds = async (req, res, next) => {
  const ids = req.body.ids;

  if(typeof ids != 'object') {
    return res.status(406).send({ error: "ids should be array of ids" });
  }
  
  var filterOption = {
    _id: null
  }
  var usedIds = []
  var nIds = []

  for (const i in ids) {
    const id = ids[i];

    const isUsed = isUsedAssessment(id);
    if(isUsed) {
      usedIds.push(id)
    } else {
      nIds.push(id)
    }
  }

  filterOption._id = { $in: nIds.map((id) => (id)) };

  if(req.user.role._id !== ROLES.admin) {
    filterOption.createdBy = req.user._id
  }

  await deleteImgFileByIds(nIds);
  await deleteVideoFileByIds(nIds);

  Assessment.remove(filterOption, function(err, result) {
    if(err) {
      return next(err);
    }

    res.json({
      success: true,
      result: result,
      deletedIds: nIds,
      relatedData: usedIds
    });
  })
}