const Worksheet = require('../models/worksheet').model;
const Paths = require('../models/worksheet').paths;
const isUsedWorkSheet = require('../models/worksheet').isUsedWorkSheet;
import { 
  filterValidValues, 
  hasOwnProperties, 
} from '../helpers/common';
import { Roles } from '../models/role';

async function makeFilter(query) {
  var filter = {
    _id: query._id || null,
    createdBy: query.createdBy || null,
  }

  if(query.name) {
    var reg = RegExp(query.name, 'gi')
    filter.name = { $regex: reg}
  }
  
  Object.keys(filter).forEach((key) => {
    if(filter[key] == null) {
      delete filter[key]
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

export const fetchAll = async (req, res, next) => {
  const { page, perPage } = req.query;

  const filterOption = await makeFilter(req.query);

  Worksheet
    .find(filterOption)
    .populate({
      path: 'createdBy',
      select: ['_id', 'firstname', 'lastname']
    })
    .populate('topicId')
    .exec((err, docs) => {
      if(err) { return next(err); }

      let totalPages = Math.ceil(docs.length / perPage)

      if (page != undefined && perPage != undefined) {
        let calculatedPage = (page - 1) * perPage;
        let calculatedPerPage = page * perPage;

        return  res.json({
          worksheets: docs.slice(calculatedPage, calculatedPerPage),
          totalPages, 
        });
      }
      res.json({
        success: true,
        worksheets: docs
      });
    })
}

export const fetchDataByQuery = async (req, res, next) => {
  const { start, end } = req.query; // optional for smart rendering.

  const filterOption = await makeFilter(req.query);

  Worksheet
    .find(filterOption)
    .populate({
      path: 'createdBy',
      select: ['_id', 'firstname', 'lastname']
    })
    .populate('topicId')
    .exec((err, docs) => {
      if(err) { return next(err); }

      res.json({
        success: true,
        worksheets: docs
      });
    })
}

export const updateWorkSheet = async function (req, res, next) {
  const id = req.params.id
  if(id == null || id == "") {
    return res.status(422).send({
      error: "id parameter is required"
    });
  }

  if(req.body.name == '' || !req.body.assessments || req.body.assessments.length == 0) {
    return res.status(422).send({
      error: "name or questions required"
    });
  }
  var condition = {
    _id: id,
  }
  if(req.user.role._id != Roles.admin) {
    condition.createdBy = req.user._id
  }

  Worksheet.findOneAndUpdate(condition, {
    topicId:      req.body.topicId,
    name:         req.body.name,
    assessments:  req.body.assessments
  }, function (err, doc, result) {
    if(err) {return next(err)}

     res.json({
       success: true,
       result: result
     });
  })
}

export const deleteWorkSheet = async function(req, res, next) {
  const id = req.params.id;

  if(!id) {
    res.status(422).send({error: "Id parameter required"});
  }

  var AssignedTask = await isUsedWorkSheet(id);
  if(AssignedTask) {
    return res.status(403).send({error: "This WorkSheet was Assgined"});
  }
  var condition = {
    _id: id
  }
  if(req.user.role._id != Roles.admin) {
    condition.createdBy = req.user._id
  }

  Worksheet.deleteOne(condition, function (err, result) {
    if(err) {return next(err)}

      res.json({
        success: true,
        result: result
      });
  })
}

export const deleteWorkSheetMany = async function(req, res, next) {
  const ids = req.body.ids;

  if(!ids || ids.length == 0) {
    res.status(422).send({error: "ids required"});
  }

  var nIds    = []
  var usedIds = []

  for (const i in ids) {
    const id = ids[i];
    var AssignedTask = await isUsedWorkSheet(id);
    if(AssignedTask) {
      usedIds.push(id)
    } else {
      nIds.push(id)
    }
  }

  var condition = {
    _id: {
      $in: nIds
    }
  }

  if(req.user.role._id != Roles.admin) {
    condition.createdBy = req.user._id
  }

  Worksheet.remove(condition, function (err, result) {
    if(err) {return next(err)}

      res.json({
        success: true,
        result: result,
        deletedIds: nIds,
        relatedData: usedIds
      });
  })
}