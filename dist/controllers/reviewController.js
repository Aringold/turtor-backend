'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.deleteReviewById = exports.getReviewMetaById = exports.getDatabyReviewId = exports.update = exports.createNew = undefined;

var _common = require('../helpers/common');

var ReviewModel = require('./../models/review');
var Review = ReviewModel.model;
var Paths = ReviewModel.paths;
var ReviewTypes = ReviewModel.ReviewTypes;

var ObjectId = require('mongoose').Types.ObjectId;
/**
 * create new
 */
var createNew = exports.createNew = function createNew(req, res, next) {
  var validObj = (0, _common.filterValidValues)(req.body, Paths);

  if (!(0, _common.hasOwnProperties)(validObj, ['description', 'type', 'stars', 'reviewId'])) {
    return res.status(422).send({ error: "description, stars, reviewId or type is missing." });
  }

  var newDoc = new Review({
    reviewId: validObj.reviewId,
    description: validObj.description,
    stars: validObj.stars,
    type: validObj.type,
    createdBy: req.user._id
  });

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

var update = exports.update = function update(req, res, next) {
  var id = req.params.id;
  var userId = req.user._id;

  var validObj = (0, _common.filterValidValues)(req.body, Paths);

  if (!(0, _common.hasOwnProperties)(validObj, ['description', 'type', 'stars'])) {
    return res.status(422).send({ error: "description, stars or type is missing." });
  }

  Review.updateOne({ _id: id, createdBy: userId }, {
    description: validObj.description,
    stars: validObj.stars
  }, function (err, doc) {
    if (err) {
      return next(err);
    }

    res.json({
      success: true,
      oldDoc: doc
    });
  });
};

/**
 * getting reviews by one's id
 */
var getDatabyReviewId = exports.getDatabyReviewId = function getDatabyReviewId(req, res, next) {
  var reviewId = req.params.reviewId;

  Review.findOne({ reviewId: reviewId }, function (err, doc) {
    if (err) {
      return next(err);
    }

    if (doc) {
      var refModel = '';
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

      Review.find({ reviewId: reviewId }).populate({
        path: 'reviewId',
        model: refModel
      }).exec(function (err, docs) {
        if (err) {
          return next(err);
        }
        res.json({
          success: true,
          reviews: docs
        });
      });
    } else {
      res.json({
        success: true,
        reviews: []
      });
    }
  });
};

var getReviewMetaById = exports.getReviewMetaById = async function getReviewMetaById(req, res, next) {
  var reviewId = req.params.reviewId;

  var count = await Review.find({ reviewId: reviewId }).count().exec();
  Review.aggregate([{
    $match: {
      reviewId: ObjectId("5fbf58fa25bda82850baa6b3")
    }
  }, {
    $group: {
      _id: 1,
      "sum": {
        $sum: "$stars"
      }
    }
  }], function (err, result) {
    if (err) {
      return next(err);
    }
    res.json({
      success: true,
      sum: result[0].sum,
      count: count
    });
  });

  // Review.find({createdBy: ObjectId("5fbf58d825bda82850baa6ae")}, function (err, docs) {
  //   if (err) {  return next(err) }

  //    res.json({
  //     docs
  //    });
  // })
};

var deleteReviewById = exports.deleteReviewById = function deleteReviewById(req, res, next) {
  var id = req.params.id;

  Review.deleteOne({ _id: id }, function (err, doc) {
    if (err) {
      return next(err);
    }

    res.json({
      success: true,
      doc: doc
    });
  });
};