const path = require('path');
const deleteFile = require('delete')
const Category = require('../models/category').model;
const CategoryPaths = require('../models/category').paths;
const isUsedCategory = require('../models/category').isUsedData;
const { filterValidValues , getFilePath, matchDownloadUrl } = require('../helpers/common');
const ObjectId = require('mongoose').Types.ObjectId

const deleteFileByIds = async function (ids) {
  var docs = await Category.find({_id: { $in: ids }});

  docs.forEach((doc) => {
    if(doc.imgUrl) {
      deleteFile(path.join(__dirname, '../../', doc.imgUrl))
    }
  })
  return true
}
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
export const createNew = async (req, res, next) => { // need to upload image
  var newData = filterValidValues(req.body, CategoryPaths);
  // var parentId = req.body.parentId;

  if(req.files[0] && req.files[0].path) {
    newData.imgUrl = getFilePath(req.files[0].path);
  }

  if(!newData.name) {
    if(newData.imgUrl) {
      deleteFile(newData.imgUrl);
    }
    return res.status(422).send({ error: "Name required" });
  }

  var category = await Category.findOne({name: newData.name});

  if(category) {
    if(newData.imgUrl) {
      deleteFile(newData.imgUrl);
    }
    return res.status(422).send({ error: "Same Category already Exists. Replace name" });
  }

  // if(parentId) {
  //   newData.isParent = false;
  // }

  var newDoc = new Category(newData);

  newDoc.save((err, doc) => {
    if(err) {
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
  })
};

/**
 * update category
 */
export const update = async (req, res, next) => {
  const id = req.params.id
  var body = filterValidValues(req.body, CategoryPaths);
  var parentId = req.body.parentId;
  if(!body.name ) {
    return res.status(422).send({ error: "Name required" });
  }

  if(req.files && req.files[0]) {
    deleteFileByIds([id]); // delete old file
    body.imgUrl = getFilePath(req.files[0].path);
  }
  
  if(parentId != undefined || parentId != null) {
    body.isParent = true;
  }

  Category.findByIdAndUpdate(id, body, function(err) {
    if(err) {
      return next(err);
    }
    res.json({
      success: true,
    });
  })
}

export const getAll = (req, res, next) => {
  const { page, perPage } = req.query;

  Category
    .find({})
    .populate('children')
    .exec(function (err, docs) {
      if(err) {
        return next(err); 
      }
      docs = matchDownloadUrl(docs, 'imgUrl');
      let totalPages = Math.ceil(docs.length / perPage)

      if (page != undefined && perPage != undefined) {
        let calculatedPage = (page - 1) * perPage;
        let calculatedPerPage = page * perPage;

        return res.json({
          success: true,
          categorioes: docs.slice(calculatedPage, calculatedPerPage),
          totalPages
        });
      }
      
      res.json({
        success: true,
        categorioes: docs
      });
    })
}
/**
 * get parent
 * skfslfskd
 */
export const getAllParent = (req, res, next) => {
  Category
    .find({isParent: true})
    .populate('children')
    .exec(function (err, docs) {
      if(err) {
        return next(err);
      }
      docs = matchDownloadUrl(docs, 'imgUrl');
      res.json({
        success: true,
        parents: docs
      });
    })
}

export const deleteById = async (req, res, next) => {
  const id = req.params.id;

  var doc = await Category.findOne({_id: id});

  if(doc.children && doc.children.length > 0) {
    return res.status(403).send({error: "Can not delete!. This Category has children!"});
  }
  // check if used
  var isUsed = await isUsedCategory(id);

  if(isUsed) {
    return res.status(403).send({error: "There are relevant Topics of this Category."});
  }

  await deleteFileByIds([id]);
  // await removeSelfInParent(id)

  Category.remove({_id: id}, function(err) { // delete itself
    if(err) {  return next(err); }
    return res.json({
      success: true,
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
  var relatedData = [];
  var nIds = []
  for (const i in ids) {
    var id = ids[i];

    let isUsed = await isUsedCategory(id)
    if(isUsed) {
      relatedData.push(id)
    } else {
      nIds.push(id)
    }
  }

  filterOption._id = { $in: nIds.map((id) => new ObjectId(id)) };
  await deleteFileByIds(nIds);

  Category.remove(filterOption, async function(err, result) {
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