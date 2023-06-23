'use strict';

var _express = require('express');

var _express2 = _interopRequireDefault(_express);

var _bodyParser = require('body-parser');

var _bodyParser2 = _interopRequireDefault(_bodyParser);

var _morgan = require('morgan');

var _morgan2 = _interopRequireDefault(_morgan);

var _mongoose = require('mongoose');

var _mongoose2 = _interopRequireDefault(_mongoose);

var _cors = require('cors');

var _cors2 = _interopRequireDefault(_cors);

var _compression = require('compression');

var _compression2 = _interopRequireDefault(_compression);

var _router = require('./router');

var _router2 = _interopRequireDefault(_router);

var _config = require('./config');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var app = (0, _express2.default)();
var http = require('http').createServer(app);
var io = require('socket.io')(http);
var SocketServer = require("./socket");

_mongoose2.default.connect('mongodb://127.0.0.1:tutor/tutor');
_mongoose2.default.set('debug', true);

app.use((0, _compression2.default)());
app.use((0, _cors2.default)({ origin: '*' }));
app.use((0, _morgan2.default)('combined'));
app.use(_bodyParser2.default.json({ limit: "15360mb", type: 'application/json' }));
app.use(_bodyParser2.default.urlencoded({ extended: false, type: 'application/json' }));

// app.use(express.static(__dirname + '../public'));
app.use(_express2.default.static(__dirname + "/../frontend"));

app.use((0, _bodyParser2.default)());

(0, _router2.default)(app);
// --------------  socket -----------------------------
SocketServer(io);
// --------------  socket -----------------------------


var port = process.env.PORT || 3000;
// const port = process.env.PORT || 3300;

http.listen(port);
console.log('server listening on:', port);