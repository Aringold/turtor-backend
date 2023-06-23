const TopicModel  = require('./../models/topic');
const Roles  = require('./../models/role').Roles;
import { filterValidValues, hasOwnProperties, deleteValues } from '../helpers/common';
const isUsedTopic  = require('./../models/topic').isUsed;

const Topic = TopicModel.model;
const Paths = TopicModel.paths;
const TopicType = TopicModel.TopicType;

async function makeFilter(query) {
  var filter = {
    _id:          query._id || null,
    categoryId:   query.categoryId || null,
    levelId:      query.levelId || null,
    question:     query.question || null,
    createdBy:    query.createdBy || null,
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


export const createNew = async (req, res, next) => {
  var validObj = filterValidValues(req.body, Paths);

  if(! hasOwnProperties(validObj, ['name', 'levelId', 'categoryId', 'type'])){
    return res.status(422).send({error: "name, level, category requied"});
  }

  validObj  = deleteValues(validObj, ['deleted']);

  var topic = await Topic.findOne({name: validObj.name, type: validObj.type});

  if(topic) {
    return res.status(422).send({ error: "Already Exists same name. Change the Topic name" });
  }
  validObj.createdBy = req.user._id;

  var newDoc = new Topic(validObj);

  newDoc.save((err, doc) => {
    if(err) { return next(err); }
    doc.populate({path: 'createdBy', select: ['_id', 'firstname', 'lastname']}, function (err1) {
      if(err1) { return next(err1); }
      res.json({
        sucess: true,
        doc: doc
      });
    });
  })
}

export const update = (req, res, next) => {
  const id = req.params.id;
  var validObj = filterValidValues(req.body, Paths);

  if(! hasOwnProperties(validObj, ['name', 'levelId', 'categoryId', 'type'])){
    return res.status(422).send({error: "name, level, category requied"});
  }
  Topic.findOneAndUpdate({_id: id}, {
    name:         validObj.name,
    description:  validObj.description,
    levelId:      validObj.levelId,
    categoryId:   validObj.categoryId,
    type:         validObj.type
  }, function (err, doc, result) {
    if(err) { return next(err); }
    res.json({
      sucess: true,
      oldDoc: doc,
      result
    });
  })
}

export const getTopics = async (req, res, next) => {
  var type = req.query.type;
  const { page, perPage } = req.query;

  var filter = await makeFilter(req.query);

  if(type == TopicType.LESSON) {
    filter.type = {$in: [TopicType.LESSON]}
  } else if(type == TopicType.ASSESSMENT) {
    filter.type = {$in: [TopicType.ASSESSMENT]}
  }

  Topic
    .find(filter)
    .populate({path: 'categoryId', select: ['_id', 'name']})
    .populate({path: 'levelId', select: ['_id', 'name']})
    .populate({path: 'createdBy', select: ['_id', 'firstname', 'lastname']})
    .sort({createdAt: -1})
    .exec(function (err, docs) {
      if(err) { return next(err); }

      let totalPages = Math.ceil(docs.length / perPage)
  
      if (page != undefined && perPage != undefined) {
        let calculatedPage = (page - 1) * perPage;
        let calculatedPerPage = page * perPage;
  
        return  res.json({
          topics: docs.slice(calculatedPage, calculatedPerPage),
          totalPages, 
        });
      }
  
      res.json({
        success: true,
        topics: docs
      });
    })
}
// export const getTopicsForTutor = (req, res, next) => {
//   var type = req.params.type;
  
// }
/**
 * delete by id
 */
export const deleteById = async (req, res, next) => {
  const id = req.params.id;
  var isUsed = await isUsedTopic(id);
  if(isUsed) {
    return res.status(403).send({error: "This topic has relevant Lesson or Assessmnet."});
  }

  if(req.user.role._id == Roles.admin) {
    Topic.deleteOne({_id: id}, function (err) {
      if(err) { return next(err); }
  
      res.json({
        success: true,
        deletedId: id
      });
    })
  } else {
    Topic.updateOne({_id: id}, { deleted: true }, function (err) {
      if(err) { return next(err); }
  
      res.json({
        success: true,
        deletedId: id
      });
    })
  }
}

/**
 * delete by ids in body
 */
export const deleteManyByIds = async (req, res, next) => {
  const ids = req.body.ids;

  if(typeof ids != 'object') {
    return res.status(406).send({ error: "ids should be array of ids" });
  }
  
  var filterOption = {
    _id: null
  }

  var usedIds = [];
  var nIds = [];
  for (const i in ids) {
    var id = ids[i];
    var isUsed = await isUsedTopic(id);
    if(isUsed) {
      usedIds.push(id)
    } else {
      nIds.push(id)
    }
  }

  filterOption._id = { $in: nIds.map((id) => (id)) };

  Topic.remove(filterOption, function(err, result) {
    if(err) {
      return next(err);
    }
    res.json({
      sucess: true,
      result: result,
      deletedIds: nIds,
      usedIds: usedIds
    });
  })
}