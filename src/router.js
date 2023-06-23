import passport from 'passport';
import passportService from './services/passport'; // dont delete this
const requireAuth = passport.authenticate('jwt', { session: false });
const requireSignin = passport.authenticate('local', { session: false });
const Roles = require('./models/role').Roles;

import multer from 'multer';
// import AvatarUploader from './middleware/filesMiddleware/AvatarUploader';
import ImageUploader from './middleware/filesMiddleware/ImageUploader';
// import VideoUploader from './middleware/filesMiddleware/VideoUploader';
import Uploader  from './middleware/filesMiddleware/Uploader';
import path from 'path';

import { signin, registerStudent, verifiEmail, resendVerification, requireAdmin, requireTutor, isNotUser } from './controllers/authController';
import { resetPassword, verifyResetPassword, resetPasswordNew } from './controllers/resetPasswordController';
import * as securityQuestionController from './controllers/securityQuestionController'
import * as UsersController from './controllers/usersController';
import * as CategoryController from './controllers/categoryController';
import * as levelController from './controllers/levelController';
import * as TopicController from './controllers/topicController';
import * as ReviewController from './controllers/reviewController';
import * as LessonController from './controllers/lessonController';
import * as AssignedController from './controllers/assignedController';
import * as AssessmentController from './controllers/assessmentController';
import * as WorksheetControlller from './controllers/worksheetControlller';
import * as answerController from './controllers/answerController';
import * as markController from './controllers/markConrtoller';

// var avatar = new AvatarUploader(path.join(__dirname, '../public/assets/imgs'))
var levelUploader = new ImageUploader(path.join(__dirname, '../public/assets/imgs/level'))
var categoryUploader = new ImageUploader(path.join(__dirname, '../public/assets/imgs/category'))
 
var lessonUploader = Uploader(path.join(__dirname, '../public/assets/lesson'))
var assessmentUploader = Uploader(path.join(__dirname, '../public/assets/assessment'))
var answerVoiceUploader = Uploader(path.join(__dirname, '../public/assets/voices'))

// var lessonUploader = multer({ dest: path.join(__dirname, '../public/assets/lesson'), filename: function (req, file, cb) {
//   cb(null, file.fieldname + '-' + uuid() + '-' + Date.now() + path.extname(file.originalname));
// }}).fields([
//   { name: 'image', maxCount: 1, },
//   { name: 'videos', maxCount: 2 },
// ])

// api end point is /api/somthing



const router = (app) => {
  app.get('/public/*', (req, res) => {
    res.download(path.join(__dirname, '..',req.url));
  });
  app.get('/assets/*', (req, res) => {
    res.download(path.join(__dirname, '..', 'frontend',req.url));
  });
  // app.post('/avatar', multer({ storage: avatar.storage, fileFilter: avatar.filter, limits: avatar.limits }).any(),  (req, res, next) => {
  //   return  res.json({
  //     success: true
  //   });
  // });

  // origin
  app.post('/api/register/:type',     registerStudent); // register oneself
  app.post('/api/signin',             requireSignin, signin);
  app.post('/api/signin-with-token',  requireAuth, signin);
  app.post('/signup/verify-email',    verifiEmail);
  app.post('/resend-verify-code',     resendVerification);
  app.post('/reset-password',         resetPassword);
  app.post('/reset-password/verify',  verifyResetPassword);
  app.post('/reset-password/new',     resetPasswordNew);

  // others

  // security-question
  app.get('/api/security-questions', securityQuestionController.getAll);
  app.post('/api/security-question/create', requireAuth, requireAdmin, securityQuestionController.createNew);
  app.put('/api/security-question/:id',     requireAuth, requireAdmin, securityQuestionController.update);
  app.delete('/api/security-question/:id',  requireAuth, requireAdmin, securityQuestionController.deleteQuestionById);
  app.delete('/api/security-questions',     requireAuth, requireAdmin, securityQuestionController.deleteQuestionByIds);
 
  // levels
  app.get('/api/levels', levelController.getAll);
  app.post('/api/level/create', requireAuth, requireAdmin, 
    multer({ storage: levelUploader.storage, fileFilter: levelUploader.filter }).any(),
    levelController.createNew); // admin pemittion
  app.put('/api/level/:id', requireAuth, requireAdmin, 
    multer({ storage: levelUploader.storage, fileFilter: levelUploader.filter }).any(),
    levelController.update);
  app.delete('/api/level/:id',  requireAuth, requireAdmin, levelController.deleteById);
  app.put('/api/levels-delete', requireAuth, requireAdmin, levelController.deleteManyByIds);


  // categoy 
  app.get('/api/categories', CategoryController.getAll);
  app.get('/api/category/parents', CategoryController.getAllParent);
  app.post('/api/category/create', requireAuth, requireAdmin,
    multer({ storage: categoryUploader.storage, fileFilter: categoryUploader.filter }).any(),
    CategoryController.createNew);
  app.put('/api/category/:id', requireAuth, requireAdmin, 
    multer({ storage: categoryUploader.storage, fileFilter: categoryUploader.filter }).any(),
    CategoryController.update);
  app.delete('/api/category/:id', requireAuth, requireAdmin, CategoryController.deleteById);
  app.put('/api/categories-delete', requireAuth, requireAdmin, CategoryController.deleteManyByIds);

  // users
  app.get('/api/tutors', UsersController.fetchTutors);
  app.get('/api/admin/users', UsersController.fetchUsers); // admin pemittion
  app.put('/api/admin/user/status/:type', requireAuth,  requireAdmin, UsersController.changeUserStatus); // admin pemittion
  app.get('/api/tutor/users', requireAuth, UsersController.fetchUsersByTutorId); //  tutor permition
  app.get('/api/user/tutors', requireAuth, UsersController.fetchTutorsByUserId); //  user permition
  app.delete('/api/user/:id', requireAuth,  requireAdmin, UsersController.deleteUserById); // admin pemittion
  app.delete('/api/users',    requireAuth,  requireAdmin, UsersController.deleteUserById); // admin pemittion.

  // -------------- not checked ------------------------------------------------- // 
  app.post('/api/tutor/register/user', requireAuth, requireTutor, UsersController.insertUserByTutor);
  app.post('/api/admin/register/:type', requireAuth, requireAdmin, function(req, res, next) { //  admin permition
    const type = req.params.type;
    UsersController.insertUserOrTutor(req, res, next, type);
  });

  // topic
  app.get('/api/management/topics', requireAuth, (req, res, next) => {
    if(Roles.admin != req.user.role._id) {
      req.query.createdBy = req.user._id;
    }
    return TopicController.getTopics(req, res, next)
  });
  app.get('/api/topics',            requireAuth, TopicController.getTopics);
  // app.get('/api/tutor/topics', TopicController.getTopicsForTutor);
  app.post('/api/topic/create',     requireAuth, isNotUser, TopicController.createNew);
  app.put('/api/topic/:id',         requireAuth, isNotUser, TopicController.update);
  app.delete('/api/topic/:id',      requireAuth, TopicController.deleteById);
  app.put('/api/delete-topics',     requireAuth, requireAdmin,TopicController.deleteManyByIds);

  // review
  app.get('/api/reviews/:reviewId',       requireAuth, ReviewController.getDatabyReviewId);
  app.get('/api/reviews/meta/:reviewId',  requireAuth, ReviewController.getReviewMetaById);
  app.post('/api/review/create',          requireAuth, ReviewController.createNew);
  app.put('/api/review/:id',              requireAuth, ReviewController.update);
  app.delete('/api/review/:id',           requireAuth, ReviewController.deleteReviewById);

  // lesson tested
  app.get('/api/lessons/management', requireAuth, LessonController.fetchAllLessons);
  // app.get('/api/lessons/all', requireAuth, LessonController.fetchAllLessons);
  app.get('/api/lesson/:id', requireAuth, LessonController.fetchlessonById);
  app.post('/api/lesson/create', requireAuth, 
    lessonUploader.any(), 
    // multer({ storage: lessonImageUploader.storage, fileFilter: lessonImageUploader.filter }).any(),
    // multer({ storage: lessonVideoUploader.storage, fileFilter: lessonVideoUploader.filter }).any(),
    LessonController.checkLessonName, 
    LessonController.createNew);
  app.put('/api/lesson/:id', requireAuth, lessonUploader.any(), LessonController.checkLessonName,  LessonController.update);
  app.put('/api/lesson/management/status/:id',  requireAuth, requireAdmin,  LessonController.changeStatus); // :type  PENDING | ACCEPTED |  DENIED
  app.delete('/api/lesson/:id',                 requireAuth,  LessonController.deleteById);
  app.put('/api/lesson-delete',                 requireAuth, requireAdmin,  LessonController.deleteByIds);
  
  
  // assign
  app.get('/api/assigns',           requireAuth, AssignedController.fetchAssignedTaskForUser);
  app.get('/api/assigns/filter',    requireAuth, AssignedController.fetchAssignedListByFilter);
  app.post('/api/assign/create',    requireAuth, AssignedController.assignTask);
  app.put('/api/assign/update/:id', requireAuth, AssignedController.updateAssign);
  app.delete('/api/assign/:id',     requireAuth, AssignedController.deletAssignedTask);
  app.put('/api/assign/mark',       requireAuth, AssignedController.makeMark);
  app.put('/api/assign/answer',     requireAuth, AssignedController.updateAnswer);

  // Assessment
  app.get('/api/assessments', requireAuth, AssessmentController.fetchAllAssessment); // queryoption for filters
  app.get('/api/assessments/filter', requireAuth, AssessmentController.fetchAssessmentByFilter); // queryoption for filters
  // app.get('/api/assessments/user/filter', requireAuth, AssessmentControll  er.fetchAssessmentByFilterForUser); // queryoption for filters
  app.get('/api/tutor/assessments', requireAuth, function (req, res, next) {
    req.query.createdBy = req.user._id
    return AssessmentController.fetchAllAssessment(req, res, next)
  }); // queryoption for filters
  app.post('/api/assessment/create',  requireAuth, assessmentUploader.any(), AssessmentController.insertAssessment);
  app.put('/api/assessment/:id',      requireAuth, assessmentUploader.any(), AssessmentController.update); // update
  app.delete('/api/assessment/:id',   requireAuth, AssessmentController.removeAssessment); // delete one
  app.put('/api/assessment-delete',   requireAuth, AssessmentController.deleteManyByIds); // delete many by ids

  // work sheet
  app.get('/api/worksheets/management', requireAuth, function (req, res, next) {
    if(req.user.role._id != Roles.admin) {
      req.query.createdBy = req.user._id
    }
    return WorksheetControlller.fetchAll(req, res, next)
  }); // queryoption for filters

  // app.get('/api/worksheet/user/filter-data', requireAuth, WorksheetControlller.insertWorkSheet);
  app.post('/api/worksheet/create', requireAuth, WorksheetControlller.fetchDataByQuery);
  app.put('/api/worksheet/:id',     requireAuth, WorksheetControlller.updateWorkSheet);
  app.delete('/api/worksheet/:id',  requireAuth, WorksheetControlller.deleteWorkSheet);
  app.put('/api/worksheet-delete',  requireAuth, WorksheetControlller.deleteWorkSheetMany);

  app.get('/api/answer/user/:assignId/:assessmentId', requireAuth, answerController.fetchAnswerByAssess_Assign);
  app.put('/api/answer/user/voice/:assignId', requireAuth, answerVoiceUploader.any(), answerController.saveVoiceAnswer);
  app.put('/api/answer/user/:type/:assignId', requireAuth, answerController.saveAnswersByType);

// mark
  app.put('/api/tutor/mark/voice', requireAuth, markController.markVoiceAnswer);
  app.put('/api/tutor/mark/text', requireAuth, markController.markTextAnswer);


  app.get("/myarea", function( req, res) {
    return renderMyarea(res)
  })
  app.get("/myarea/*", function(req, res) {
      // main page vuexy
      return renderMyarea(res)
  })

  app.get("/*", function(req, res) {
      //  landing page
      return res.sendFile(__dirname + "/../frontend/index.html");
  })
};

const renderMyarea = (res) => {
  console.log('here');
  return res.sendFile(path.resolve(__dirname + "/../frontend/index.html"))
}

export default router;