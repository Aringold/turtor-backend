import { filterValidValues, getFilePath, matchDownloadUrl } from '../helpers/common';
import path from 'path';
const deleteFile = require('delete')
const LevelModel = require('../models/level').model;
const isUsedLevel = require('../models/level').isUsed;
const ObjectId = require('mongoose').Types.ObjectId;


const checkNameExists = async function (name) {
  var doc = await LevelModel.find({ name: name }).then((doc));
  return doc.length > 0;
}

const deleteFileByIds = async function (ids) {
  var docs = await LevelModel.find({_id: { $in: ids }});
  docs.forEach((doc) => {
    if(doc.imgUrl != "" && doc.imgUrl) {
      deleteFile(path.join(__dirname, '../../', doc.imgUrl))
    }
  })
  return true
}

// done
export const createNew = async (req, res, next) => {
  var validDoc = filterValidValues(req.body, ['name', 'description', 'iconClassName', 'imgUrl']);

  var doc = await checkNameExists(validDoc.name);
  if(validDoc.name == '' || doc) {
    deleteFile(req.files[0] && req.files[0].path)
    return res.status(422).send({error: 'Same name already exists!'});
  }
  if(req.files && req.files[0]) {
    validDoc.imgUrl = getFilePath(req.files[0].path);
  }
  var newDoc = new LevelModel(validDoc);

  newDoc.save((err, doc) => {
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
export const update = async (req, res, next) => {
  const id = req.params.id;

  var validDoc = filterValidValues(req.body, ['name', 'description', 'iconClassName', 'imgUrl']);
  var docs = await LevelModel.find({name: validDoc.name, _id: { $ne: id }});
  if(docs.length > 0) {
    return res.status(422).send({error: 'Same name already exists!'});
  }
  if(req.files && req.files[0]) {
    await deleteFileByIds([id]);
    validDoc.imgUrl = getFilePath(req.files[0].path);
  }

  LevelModel.findByIdAndUpdate(id, validDoc, function(err, doc) {
    if(err) {
      return next(err);
    }
    res.json({
      success: true,
      oldDoc: doc
    });
  })
}

// done
export const getAll = (req, res, next) => {
  const { page, perPage } = req.query;

  LevelModel.find({}, function(err, docs) {
    if(err) {
      return next(err);
    }
    docs = matchDownloadUrl(docs, 'imgUrl');
    
    let totalPages = Math.ceil(docs.length / perPage)

    if (page != undefined && perPage != undefined) {
      let calculatedPage = (page - 1) * perPage;
      let calculatedPerPage = page * perPage;

      return  res.json({
        levels: docs.slice(calculatedPage, calculatedPerPage),
        totalPages
      });
    }
    res.json({
      success: true,
      levels: docs
    });
  })
}
// done
export const deleteById = async (req, res, next) => {
  const id = req.params.id;
  let isUsed = await isUsedLevel(id)
  if(isUsed) {
    return res.status(406).send({ error: "There is relevant data of this level." });
  }
  
  await deleteFileByIds([id]);

  LevelModel.deleteOne({_id: id}, async function(err, result) {
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
export const deleteManyByIds = async (req, res, next) => {
  const ids = req.body.ids;

  if(typeof ids != 'object') {
    return res.status(406).send({ error: "ids should be array of ids" });
  }

  var filterOption = {
    _id: null
  }
  var relatedData = [];
  var nIds = []
  for (const i in ids) {
    var id = ids[i];

    let isUsed = await isUsedLevel(id)
    if(isUsed) {
      relatedData.push(id)
    } else {
      nIds.push(id)
    }
  }


  filterOption._id = { $in: nIds.map((id) => new ObjectId(id)) };
  await deleteFileByIds(nIds);

  LevelModel.remove(filterOption, async function(err, result) {
    if(err) {
      return next(err);
    }

    res.json({
      success: true,
      result: result,
      deletedIds: nIds,
      relatedData: relatedData
    });
  })
}
