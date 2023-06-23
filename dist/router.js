'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _passport = require('passport');

var _passport2 = _interopRequireDefault(_passport);

var _passport3 = require('./services/passport');

var _passport4 = _interopRequireDefault(_passport3);

var _multer = require('multer');

var _multer2 = _interopRequireDefault(_multer);

var _ImageUploader = require('./middleware/filesMiddleware/ImageUploader');

var _ImageUploader2 = _interopRequireDefault(_ImageUploader);

var _Uploader = require('./middleware/filesMiddleware/Uploader');

var _Uploader2 = _interopRequireDefault(_Uploader);

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _authController = require('./controllers/authController');

var _resetPasswordController = require('./controllers/resetPasswordController');

var _securityQuestionController = require('./controllers/securityQuestionController');

var securityQuestionController = _interopRequireWildcard(_securityQuestionController);

var _usersController = require('./controllers/usersController');

var UsersController = _interopRequireWildcard(_usersController);

var _categoryController = require('./controllers/categoryController');

var CategoryController = _interopRequireWildcard(_categoryController);

var _levelController = require('./controllers/levelController');

var levelController = _interopRequireWildcard(_levelController);

var _topicController = require('./controllers/topicController');

var TopicController = _interopRequireWildcard(_topicController);

var _reviewController = require('./controllers/reviewController');

var ReviewController = _interopRequireWildcard(_reviewController);

var _lessonController = require('./controllers/lessonController');

var LessonController = _interopRequireWildcard(_lessonController);

var _assignedController = require('./controllers/assignedController');

var AssignedController = _interopRequireWildcard(_assignedController);

var _assessmentController = require('./controllers/assessmentController');

var AssessmentController = _interopRequireWildcard(_assessmentController);

var _worksheetControlller = require('./controllers/worksheetControlller');

var WorksheetControlller = _interopRequireWildcard(_worksheetControlller);

var _answerController = require('./controllers/answerController');

var answerController = _interopRequireWildcard(_answerController);

var _markConrtoller = require('./controllers/markConrtoller');

var markController = _interopRequireWildcard(_markConrtoller);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// dont delete this
var requireAuth = _passport2.default.authenticate('jwt', { session: false });
var requireSignin = _passport2.default.authenticate('local', { session: false });
var Roles = require('./models/role').Roles;
// import AvatarUploader from './middleware/filesMiddleware/AvatarUploader';

// import VideoUploader from './middleware/filesMiddleware/VideoUploader';


// var avatar = new AvatarUploader(path.join(__dirname, '../public/assets/imgs'))
var levelUploader = new _ImageUploader2.default(_path2.default.join(__dirname, '../public/assets/imgs/level'));
var categoryUploader = new _ImageUploader2.default(_path2.default.join(__dirname, '../public/assets/imgs/category'));

var lessonUploader = (0, _Uploader2.default)(_path2.default.join(__dirname, '../public/assets/lesson'));
var assessmentUploader = (0, _Uploader2.default)(_path2.default.join(__dirname, '../public/assets/assessment'));
var answerVoiceUploader = (0, _Uploader2.default)(_path2.default.join(__dirname, '../public/assets/voices'));

// var lessonUploader = multer({ dest: path.join(__dirname, '../public/assets/lesson'), filename: function (req, file, cb) {
//   cb(null, file.fieldname + '-' + uuid() + '-' + Date.now() + path.extname(file.originalname));
// }}).fields([
//   { name: 'image', maxCount: 1, },
//   { name: 'videos', maxCount: 2 },
// ])

// api end point is /api/somthing


var router = function router(app) {
  app.get('/public/*', function (req, res) {
    res.download(_path2.default.join(__dirname, '..', req.url));
  });
  app.get('/assets/*', function (req, res) {
    res.download(_path2.default.join(__dirname, '..', 'frontend', req.url));
  });
  // app.post('/avatar', multer({ storage: avatar.storage, fileFilter: avatar.filter, limits: avatar.limits }).any(),  (req, res, next) => {
  //   return  res.json({
  //     success: true
  //   });
  // });

  // origin
  app.post('/api/register/:type', _authController.registerStudent); // register oneself
  app.post('/api/signin', requireSignin, _authController.signin);
  app.post('/api/signin-with-token', requireAuth, _authController.signin);
  app.post('/signup/verify-email', _authController.verifiEmail);
  app.post('/resend-verify-code', _authController.resendVerification);
  app.post('/reset-password', _resetPasswordController.resetPassword);
  app.post('/reset-password/verify', _resetPasswordController.verifyResetPassword);
  app.post('/reset-password/new', _resetPasswordController.resetPasswordNew);

  // others

  // security-question
  app.get('/api/security-questions', securityQuestionController.getAll);
  app.post('/api/security-question/create', requireAuth, _authController.requireAdmin, securityQuestionController.createNew);
  app.put('/api/security-question/:id', requireAuth, _authController.requireAdmin, securityQuestionController.update);
  app.delete('/api/security-question/:id', requireAuth, _authController.requireAdmin, securityQuestionController.deleteQuestionById);
  app.delete('/api/security-questions', requireAuth, _authController.requireAdmin, securityQuestionController.deleteQuestionByIds);

  // levels
  app.get('/api/levels', levelController.getAll);
  app.post('/api/level/create', requireAuth, _authController.requireAdmin, (0, _multer2.default)({ storage: levelUploader.storage, fileFilter: levelUploader.filter }).any(), levelController.createNew); // admin pemittion
  app.put('/api/level/:id', requireAuth, _authController.requireAdmin, (0, _multer2.default)({ storage: levelUploader.storage, fileFilter: levelUploader.filter }).any(), levelController.update);
  app.delete('/api/level/:id', requireAuth, _authController.requireAdmin, levelController.deleteById);
  app.put('/api/levels-delete', requireAuth, _authController.requireAdmin, levelController.deleteManyByIds);

  // categoy 
  app.get('/api/categories', CategoryController.getAll);
  app.get('/api/category/parents', CategoryController.getAllParent);
  app.post('/api/category/create', requireAuth, _authController.requireAdmin, (0, _multer2.default)({ storage: categoryUploader.storage, fileFilter: categoryUploader.filter }).any(), CategoryController.createNew);
  app.put('/api/category/:id', requireAuth, _authController.requireAdmin, (0, _multer2.default)({ storage: categoryUploader.storage, fileFilter: categoryUploader.filter }).any(), CategoryController.update);
  app.delete('/api/category/:id', requireAuth, _authController.requireAdmin, CategoryController.deleteById);
  app.put('/api/categories-delete', requireAuth, _authController.requireAdmin, CategoryController.deleteManyByIds);

  // users
  app.get('/api/tutors', UsersController.fetchTutors);
  app.get('/api/admin/users', UsersController.fetchUsers); // admin pemittion
  app.put('/api/admin/user/status/:type', requireAuth, _authController.requireAdmin, UsersController.changeUserStatus); // admin pemittion
  app.get('/api/tutor/users', requireAuth, UsersController.fetchUsersByTutorId); //  tutor permition
  app.get('/api/user/tutors', requireAuth, UsersController.fetchTutorsByUserId); //  user permition
  app.delete('/api/user/:id', requireAuth, _authController.requireAdmin, UsersController.deleteUserById); // admin pemittion
  app.delete('/api/users', requireAuth, _authController.requireAdmin, UsersController.deleteUserById); // admin pemittion.

  // -------------- not checked ------------------------------------------------- // 
  app.post('/api/tutor/register/user', requireAuth, _authController.requireTutor, UsersController.insertUserByTutor);
  app.post('/api/admin/register/:type', requireAuth, _authController.requireAdmin, function (req, res, next) {
    //  admin permition
    var type = req.params.type;
    UsersController.insertUserOrTutor(req, res, next, type);
  });

  // topic
  app.get('/api/management/topics', requireAuth, function (req, res, next) {
    if (Roles.admin != req.user.role._id) {
      req.query.createdBy = req.user._id;
    }
    return TopicController.getTopics(req, res, next);
  });
  app.get('/api/topics', requireAuth, TopicController.getTopics);
  // app.get('/api/tutor/topics', TopicController.getTopicsForTutor);
  app.post('/api/topic/create', requireAuth, _authController.isNotUser, TopicController.createNew);
  app.put('/api/topic/:id', requireAuth, _authController.isNotUser, TopicController.update);
  app.delete('/api/topic/:id', requireAuth, TopicController.deleteById);
  app.put('/api/delete-topics', requireAuth, _authController.requireAdmin, TopicController.deleteManyByIds);

  // review
  app.get('/api/reviews/:reviewId', requireAuth, ReviewController.getDatabyReviewId);
  app.get('/api/reviews/meta/:reviewId', requireAuth, ReviewController.getReviewMetaById);
  app.post('/api/review/create', requireAuth, ReviewController.createNew);
  app.put('/api/review/:id', requireAuth, ReviewController.update);
  app.delete('/api/review/:id', requireAuth, ReviewController.deleteReviewById);

  // lesson tested
  app.get('/api/lessons/management', requireAuth, LessonController.fetchAllLessons);
  // app.get('/api/lessons/all', requireAuth, LessonController.fetchAllLessons);
  app.get('/api/lesson/:id', requireAuth, LessonController.fetchlessonById);
  app.post('/api/lesson/create', requireAuth, lessonUploader.any(),
  // multer({ storage: lessonImageUploader.storage, fileFilter: lessonImageUploader.filter }).any(),
  // multer({ storage: lessonVideoUploader.storage, fileFilter: lessonVideoUploader.filter }).any(),
  LessonController.checkLessonName, LessonController.createNew);
  app.put('/api/lesson/:id', requireAuth, lessonUploader.any(), LessonController.checkLessonName, LessonController.update);
  app.put('/api/lesson/management/status/:id', requireAuth, _authController.requireAdmin, LessonController.changeStatus); // :type  PENDING | ACCEPTED |  DENIED
  app.delete('/api/lesson/:id', requireAuth, LessonController.deleteById);
  app.put('/api/lesson-delete', requireAuth, _authController.requireAdmin, LessonController.deleteByIds);

  // assign
  app.get('/api/assigns', requireAuth, AssignedController.fetchAssignedTaskForUser);
  app.get('/api/assigns/filter', requireAuth, AssignedController.fetchAssignedListByFilter);
  app.post('/api/assign/create', requireAuth, AssignedController.assignTask);
  app.put('/api/assign/update/:id', requireAuth, AssignedController.updateAssign);
  app.delete('/api/assign/:id', requireAuth, AssignedController.deletAssignedTask);
  app.put('/api/assign/mark', requireAuth, AssignedController.makeMark);
  app.put('/api/assign/answer', requireAuth, AssignedController.updateAnswer);

  // Assessment
  app.get('/api/assessments', requireAuth, AssessmentController.fetchAllAssessment); // queryoption for filters
  app.get('/api/assessments/filter', requireAuth, AssessmentController.fetchAssessmentByFilter); // queryoption for filters
  // app.get('/api/assessments/user/filter', requireAuth, AssessmentControll  er.fetchAssessmentByFilterForUser); // queryoption for filters
  app.get('/api/tutor/assessments', requireAuth, function (req, res, next) {
    req.query.createdBy = req.user._id;
    return AssessmentController.fetchAllAssessment(req, res, next);
  }); // queryoption for filters
  app.post('/api/assessment/create', requireAuth, assessmentUploader.any(), AssessmentController.insertAssessment);
  app.put('/api/assessment/:id', requireAuth, assessmentUploader.any(), AssessmentController.update); // update
  app.delete('/api/assessment/:id', requireAuth, AssessmentController.removeAssessment); // delete one
  app.put('/api/assessment-delete', requireAuth, AssessmentController.deleteManyByIds); // delete many by ids

  // work sheet
  app.get('/api/worksheets/management', requireAuth, function (req, res, next) {
    if (req.user.role._id != Roles.admin) {
      req.query.createdBy = req.user._id;
    }
    return WorksheetControlller.fetchAll(req, res, next);
  }); // queryoption for filters

  // app.get('/api/worksheet/user/filter-data', requireAuth, WorksheetControlller.insertWorkSheet);
  app.post('/api/worksheet/create', requireAuth, WorksheetControlller.fetchDataByQuery);
  app.put('/api/worksheet/:id', requireAuth, WorksheetControlller.updateWorkSheet);
  app.delete('/api/worksheet/:id', requireAuth, WorksheetControlller.deleteWorkSheet);
  app.put('/api/worksheet-delete', requireAuth, WorksheetControlller.deleteWorkSheetMany);

  app.get('/api/answer/user/:assignId/:assessmentId', requireAuth, answerController.fetchAnswerByAssess_Assign);
  app.put('/api/answer/user/voice/:assignId', requireAuth, answerVoiceUploader.any(), answerController.saveVoiceAnswer);
  app.put('/api/answer/user/:type/:assignId', requireAuth, answerController.saveAnswersByType);

  // mark
  app.put('/api/tutor/mark/voice', requireAuth, markController.markVoiceAnswer);
  app.put('/api/tutor/mark/text', requireAuth, markController.markTextAnswer);

  app.get("/myarea", function (req, res) {
    return renderMyarea(res);
  });
  app.get("/myarea/*", function (req, res) {
    // main page vuexy
    return renderMyarea(res);
  });

  app.get("/*", function (req, res) {
    //  landing page
    return res.sendFile(__dirname + "/../frontend/index.html");
  });
};

var renderMyarea = function renderMyarea(res) {
  console.log('here');
  return res.sendFile(_path2.default.resolve(__dirname + "/../frontend/index.html"));
};

exports.default = router;