import nodemailer from 'nodemailer';
import bcrypt from 'bcrypt-nodejs';
import { sendVerificationEmail } from '../helpers/email';
import { tokenForUser } from '../helpers/token';
import { deleteAllNull, filterValidValues, matchDownloadUrlByStr } from '../helpers/common';
const User = require('../models/user').model;
const Roles = require('../models/role').Roles;
const userPaths = require('../models/user').paths;
const userRoleId = Roles.user;
const tutorRoleId = Roles.tutor;
/**
 * Sign in
 */
export const signin = (req, res) => {
  const { firstname, lastname, email, role, status, avatar, _id } = req.user;

  res.json({ 
    token: tokenForUser(req.user), 
    firstname, 
    lastname,
    id: _id,
    email, 
    role, 
    status, 
    avatar: matchDownloadUrlByStr(avatar)
  });
};

/**
 * Sign up
 */
export const registerStudent = (req, res, next) => {
  var newValues = filterValidValues(req.body, userPaths);
  const type = req.params.type;
  const {
    firstname, lastname, email, password, identificationNumber, contactNumber, gender,  level, SecQuestionId, SecQestionAnswer
  } = newValues;

  var newUser = deleteAllNull(newValues);
  if(type != 'user' && type != 'tutor') {
    return res.status(422).send({ error: "type param required" });
  }
  if(type == 'user') {
    if (!firstname || !lastname || !email || !password || !identificationNumber 
        || !contactNumber || !gender || ! level || !SecQuestionId || !SecQestionAnswer
    ) {
      return res.status(422).send({ error: "all fields are required" });
    }
    newUser.role = userRoleId;
    newUser.status = 1; // user
  } else {
    if (!firstname || !lastname || !email || !password || !identificationNumber 
      || !contactNumber || !gender || !SecQuestionId || !SecQestionAnswer
  ) {
    return res.status(422).send({ error: "all fields are required" });
  }
    newUser.role = tutorRoleId;
    newUser.status = 0; // tutor
  }
  
  User.findOne({ email }, (err, existingUser) => {
    if (err) { return next(err); }

    if (existingUser) {
      return res.status(422).send({ error: "Email is in use" });
    }

    const user = new User(newUser);

    user.save((err, doc) => {
      if (err) { return next(err); }
      // sendVerificationEmail(email, firstname, user.auth.token); 
      res.json({ success: true });
    });
  });
};
/**
 * require Admin
 */
export const requireAdmin = (req, res, next) => {
  if(req.user.role._id != Roles.admin)  {
    return res.status(401).send({ error: "Admin permission required" });
  }
  next(null, true);
}
export const requireTutor = (req, res, next) => {
  if(req.user.role._id != Roles.tutor)  {
    return res.status(401).send({ error: "Tutor permition required" });
  }
  next(null, true);
}
export const isNotUser = (req, res, next) => {
  if(req.user.role._id == Roles.user)  {
    return res.status(401).send({ error: "required permition" });
  }
  next(null, true);
}
/**
 * Resend verification code
 */
export const resendVerification = (req, res, next) => {
  const { email } = req.body;

  User.findOne({ email }, (err, user) => {
    if (err) { return next(err); }

    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);

    User.findByIdAndUpdate(user.id, { auth: { used: false, token: user.auth.token, expires: tomorrow } }, (err) => {
      if (err) { return next(err); }

      const { firstname, email } = user;

      sendVerificationEmail(email, firstname, user.auth.token);

      res.json({ success: true });
    });
  });
};

/**
 * Verify email
 */
export const verifiEmail = (req, res, next) => {
  const { email, token } = req.body;

  User.findOne({ email }, (err, user) => {
    if (err) { return next(err); }

    if (!user) {
      return res.status(422).send({ error: { message: "User doesnt exists", resend: false } });
    }

    if (user.auth.used) {
      return res.status(422).send({ error: { message: "link already used", resend: false } });
    }

    if (new Date() > user.auth.expires) {
      return res.status(422).send({ error: { message: "link already expired", resend: true } });
    }

    if (token !== user.auth.token) {
      return res.status(422).send({ error: { message: "something has gone wrong, please sign up again", resend: false } });
    }

    User.findByIdAndUpdate(user.id, { role: 1, auth: { used: true } }, (err) => {
      if (err) { return next(err); }

      const { email, firstname, lastname } = user;

      res.json({ token: tokenForUser(user), email, firstname, lastname });
    });
  });
};
