const ReviewModel = require('./../models/review');
const Review = ReviewModel.model;
const Paths = ReviewModel.paths;
const ReviewTypes = ReviewModel.ReviewTypes;
import { filterValidValues, deleteAllNull, hasOwnProperties, deleteValues, isEmptyObject } from '../helpers/common';
const ObjectId = require('mongoose').Types.ObjectId
/**
 * create new
 */
export const createNew = (req, res, next) => {
  var validObj = filterValidValues(req.body, Paths);

  if(! hasOwnProperties(validObj, ['description', 'type', 'stars', 'reviewId'])){
    return res.status(422).send({error: "description, stars, reviewId or type is missing."});
  }


  var newDoc = new Review({
    reviewId: validObj.reviewId,
    description: validObj.description,
    stars: validObj.stars,
    type: validObj.type,
    createdBy: req.user._id
  });

  newDoc.save((err, doc) => {
    if(err) {
      return next(err);
    }
    res.json({
      success: true,
      doc: doc
    });
  })
}

export const update = (req, res, next) => {
  const id = req.params.id;
  const userId = req.user._id;

  var validObj = filterValidValues(req.body, Paths);


  if(! hasOwnProperties(validObj, ['description', 'type', 'stars'])){
    return res.status(422).send({error: "description, stars or type is missing."});
  }

  Review.updateOne({_id: id, createdBy: userId }, {
    description: validObj.description,
    stars: validObj.stars
  }, function (err, doc) {
    if(err) { return next(err); }

    res.json({
      success: true,
      oldDoc: doc
    });
  })
}

/**
 * getting reviews by one's id
 */
export const getDatabyReviewId = (req, res, next) => {
  var reviewId = req.params.reviewId;
  
  Review.findOne({ reviewId: reviewId }, function (err, doc) {
    if(err) { return next(err); }

    if(doc) {
      var refModel = ''
      switch (doc.type) {
        case ReviewTypes.ASSESSMENT:
          refModel = 'assessment';
          break;
        case ReviewTypes.LESSON:
          refModel = 'lesson';
          break;
     
        case ReviewTypes.USER:
          refModel = 'user';
          break;
        default:
          break;
      }

      Review
        .find({reviewId: reviewId})
        .populate({
          path: 'reviewId',
          model: refModel
        })
        .exec(function (err, docs) {
          if(err) { return next(err); }
          res.json({
            success: true,
            reviews: docs
          });
        })

    } else {
       res.json({
        success: true,
        reviews: []
       });
    }
  })
}

export const getReviewMetaById = async (req, res, next) => {
  const reviewId = req.params.reviewId;

  var count = await Review.find({reviewId}).count().exec()
  Review.aggregate([
    {
      $match: {
        reviewId: ObjectId("5fbf58fa25bda82850baa6b3")
      },
    },
    {
      $group: {
        _id: 1,
        "sum": {
          $sum: "$stars"
        },
      }
    }
  ], function (err, result) {
      if (err) {  return next(err) }
      res.json({
          success: true,
          sum: result[0].sum,
          count: count
      });
  })

  // Review.find({createdBy: ObjectId("5fbf58d825bda82850baa6ae")}, function (err, docs) {
  //   if (err) {  return next(err) }

  //    res.json({
  //     docs
  //    });
  // })
}

export const deleteReviewById = (req, res, next) => {
  const id = req.params.id;

  Review.deleteOne({_id: id}, function (err, doc) {
    if(err) {return next(err)}

     res.json({
       success: true,
       doc: doc
     });
  });
}