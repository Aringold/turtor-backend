const User = require('../models/user').model;
const Roles = require('../models/role').Roles;
const userPaths = require('../models/user').paths;
const UserStatus = require('../models/user').UserStatus;
const getStatusValue = require('../models/user').getStatusValue;
const { ObjectId } = require('mongoose').Types;
import { deleteAllNull, filterValidValues, matchDownloadUrl } from '../helpers/common';

function makeFilter(query) {
  var filter = {
    _id: query.id || null,
    email: query.email ? {$regex: new RegExp(query.email, 'gi')} : null,
    parentName: query.parentName ? {$regex: new RegExp(query.parentName, 'gi')} : null,
    gender: query.gender || null,
    level: query.level || null,
    role: query.role || null,
    status: query.status || null,
    deleted: query.deleted || null,
    // createdAt: query.createdAt ? {$gte: query.createdAt } : null,
   "address.country": query.country ? {$regex: query.country, $options: 'gi'} : null,
   "address.zipOrPostalCode": query.zipOrPostalCode ? {$regex: query.zipOrPostalCode, $options: 'gi'} : null,
  }

  Object.keys(filter).forEach(key => {
    if(filter[key] == null || filter[key] || undefined) {
      delete filter[key]
    }
  })
  return filter
}

/**
 * get all user for admin
 */
export const fetchUsers = (req, res, next) => {
  var filter = makeFilter(req.query);
  User
    .find(filter)
    .populate('level')
    .populate('role')
    .exec(function (err, users) {
      if (err) { return next(err); }

      if(req.query.name) {
        users = users.filter((user) => {
          var name = user.firstname + " " + user.lastname;
          var reg = new RegExp(req.query.name, 'gi')

          return name.search(reg) > -1;
        })
      }
      res.json({
        users: users
      });
    })
  ;
};
/**
 * delete many by ids for admin only
 */
export const deleteManyByIds = async (req, res, next) => {
  // const ids = ['5fbe97269e049239b8fd522b', '5fbe9b0c05f5304f1c2cdaf6', '5fbe9b0f05f5304f1c2cdaf7']
  const ids = req.body.ids;

  if(typeof ids != 'object') {
    return res.status(406).send({ error: "ids should be array of ids" });
  }

  var filterOption = {
    _id: null
  }

  filterOption._id = { $in: ids.map((id) => new ObjectId(id)) };

  User.remove(filterOption, function(err, result) {
    if(err) {
      return next(err);
    }
    res.json({
      sucess: true,
      result: result
    });
  })
}

/**
 * createing user by admin
 * @param {*} type  tutor | user
 */
export const insertUserOrTutor = (req, res, next, type) => {
  var newValues = filterValidValues(req.body, userPaths);
  const {
    firstname, lastname, email, password, identificationNumber, contactNumber, gender
  } = newValues;


  if(type != 'user' && type != 'tutor') {
    return res.status(422).send({ error: "type param required" });
  }
  if (!firstname || !lastname || !email || !password || !identificationNumber 
      || !contactNumber || !gender
  ) {
    return res.status(422).send({ error: "all fields are required" });
  }

  var newUser = deleteAllNull(newValues);
  if(type == 'user') {
    newUser.role = Roles.user;
  } else {
    newUser.role = tutorRoleId;
  }
  newUser.status = 1; // active
  
  User.findOne({ email }, (err, existingUser) => {
    if (err) { return next(err); }

    if (existingUser) {
      return res.status(422).send({ error: "Email is in use" });
    }

    const user = new User(newUser);

    user.save((err, doc) => {
      if (err) { return next(err); }
      // sendVerificationEmail(email, firstname, user.auth.token); 
      res.json({ success: true, user: doc});
    });
  });
}
/**
 * @param {Enumerator} type active | pending | denied |
 */
export const changeUserStatus = (req, res, next) => {
  const type = req.params.type;
  const userId = req.body.id;

  if (type != UserStatus.PENDING || type != UserStatus.ACCEPTED || type != UserStatus.DENIED) {
    return req.status(422).send({error: 'Correct type required'})
  }

  const typeValue = getStatusValue(type);

  User.findOneAndUpdate({_id: userId}, { status: typeValue}, function (err, doc, result) {
    if (err) { return next(err) }

     res.jsonp({
       success: true,
       doc: doc,
       result
     });
  })
}
/**
 * delete user for admin
 */
export const deleteUserById = (req, res, next) => {
  const id = req.params.id

  User.updateOne({_id: id}, {deleted: true}, function(err, result) {
    if(err) {
      return next(err);
    }
    res.json({
      sucess: true,
      result: result
    });
  })
}
export const deleteUsers = (req, res, next) => {
  const ids = req.body.ids;
  if(ids && ids.length < 0) {
    res.status(422).send({error: "ids should be an array of ids"});
  }

  User.updateOne({_id: {$in: ids }}, {deleted: true}, function(err, result) {
    if(err) {
      return next(err);
    }
    res.json({
      sucess: true,
      result: result
    });
  })
}

export const perfectDeleteUserById = (req, res, next) => {
  const id = req.params.id

  User.deleteOne({_id: id}, function(err, result) {
    if(err) {
      return next(err);
    }
    res.json({
      sucess: true,
      result: result
    });
  })
}
export const perfectDeleteUsers = (req, res, next) => {
  const ids = req.body.ids;
  if(ids && ids.length < 0) {
    res.status(422).send({error: "ids should be an array of ids"});
  }

  User.deleteMany({_id: {$in: ids }}, {deleted: true}, function(err, result) {
    if(err) {
      return next(err);
    }
    res.json({
      sucess: true,
      result: result
    });
  })
}

export const fetchUsersByTutorId = (req, res, next) => {
  const tutorId = req.user._id;
  const fields = [
    'firstname',
    'lastname',
    'email',
    'gender',
    'contactNumber',
    'address',
    'parentName',
    'level',
    'avatar',
    'tutors',
    'SecQuestionId',
    'SecQestionAnswer',
    'aboutMeTitle',
    'aboutMe',
    'role',
    'status',
  ]
  
  User
    .find({tutors: {$all: [tutorId]}}, fields)
    .populate('level')
    .populate('role')
    .exec(function (err, users) {
      if (err) { return next(err); }

      users = matchDownloadUrl(users, 'avatar')

      return res.json({
        success: true,
        users: users
      });
    })
};

export const fetchTutorsByUserId = (req, res, next) => {
  const tutors = req.user.tutors;

  User
    .find({_id: {$in: tutors }}, [
      '_id',
      'firstname',
      'lastname',
      'email',
      'gender',
      'identificationNumber',
      'contactNumber',
      'address.country',
      'address.content',
      'address.zipOrPostalCode',
      'parentName',
      'level',
      'avatar',
      'tutors',
      'CA_or_SA_score',
      'refCode',
      'aboutMeTitle',
      'aboutMe',
      'role',
    ])
    .populate('level')
    .populate('role')
    .exec(function (err, users) {
      if (err) { return next(err); }
      res.json({users});
    })
}

export const fetchTutors = (req, res, next) => {
  User
    .find({status: 1, role: { _id: Roles.tutor}},[
      '_id',
      'firstname',
      'lastname',
      'email',
      'gender',
      'contactNumber',
      'address.country',
      'address.content',
      'address.zipOrPostalCode',
      'avatar',
      'CA_or_SA_score',
      'refCode',
      'aboutMeTitle',
      'aboutMe',
      'role',
    ])
    .populate('role')
    .populate('level')
    .exec(function (err, tutors) {
      if (err) { return next(err); }
      res.json({tutors: tutors});
    });
}
/**
 *  creating user by tutor
 * @param {string} type tutor | student
 */
export const insertUserByTutor = (req, res, next) => {
  var newValues = filterValidValues(req.body, userPaths);
  const {
    firstname, lastname, email, password, identificationNumber, contactNumber, gender
  } = newValues;

  if (!firstname || !lastname || !email || !password || !identificationNumber 
      || !contactNumber || !gender
  ) {
    return res.status(422).send({ error: "all fields are required" });
  }

  var newUser = deleteAllNull(newValues);

  newUser.role = Roles.user;
  newUser.status = 1; // user
  newUser.tutors = [req.user._id];

   User.findOne({ email }, (err, existingUser) => {
    if (err) { return next(err); }

    if (existingUser) {
      return res.status(422).send({ error: "Email is in use" });
    }

    const user = new User(newUser);

    user.save((err, doc) => {
      if (err) { return next(err); }
      // sendVerificationEmail(email, firstname, user.auth.token); 
      res.json({ success: true, user: doc});
    });
  });
}

/**
 * fetch User
 */
 export const fetchUser = (req, res, next) => {
    const id = req.params.id
    User
      .findOne({_id: id})
      .populate('level')
      .populate('role')
      .exec(function (err, users) {
        if (err) { return next(err); }
        res.json({users});
      })
    ;
};

// ***********************************************************************************
/**
 * update user info
 */
export const updateUserInfo = (req, res, next) => { // need perform
  var formValues = filterValidValues(req.body, userPaths);
  formValues = deleteAllNull(formValues);
};