'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

exports.deleteAllNull = deleteAllNull;
exports.filterValidValues = filterValidValues;
exports.deleteValues = deleteValues;
exports.hasOwnProperties = hasOwnProperties;
exports.isEmptyObject = isEmptyObject;
exports.getFilePath = getFilePath;
exports.matchDownloadUrl = matchDownloadUrl;
exports.matchDownloadUrlByStr = matchDownloadUrlByStr;
exports.deleteReqFiles = deleteReqFiles;

var _require = require('../config'),
    ROOT_URL = _require.ROOT_URL;

var path = require('path');
var deleteFile = require('delete');

/**
 * delete all null from object
 * @param {Object} obj 
 */
function deleteAllNull(obj) {
  if ((typeof obj === 'undefined' ? 'undefined' : _typeof(obj)) != 'object') {
    return obj;
  }
  var newObj = obj;
  Object.keys(newObj).forEach(function (key) {
    if (newObj[key] == null || newObj[key] == "") {
      delete newObj[key];
    }
  });

  return newObj;
}

function filterValidValues(body, keys) {
  // @param1 req.body @param2 array of keys
  var newObj = {};

  keys.forEach(function (key) {
    if (body[key]) {
      newObj[key] = body[key];
    }
  });

  return newObj;
}

/**
 * @param {Object} obj 
 * @param {Array} keys 
 */
function deleteValues(obj, keys) {
  // @param1 req.body @param2 array of keys
  var newObj = Object.assign({}, obj);
  keys.forEach(function (key) {
    if (newObj[key]) {
      delete newObj[key];
    }
  });
  return newObj;
}

/**
 * 
 * @param {Object} obj 
 * @param {Array} properties 
 */
function hasOwnProperties(obj, properties) {
  var _iteratorNormalCompletion = true;
  var _didIteratorError = false;
  var _iteratorError = undefined;

  try {
    for (var _iterator = properties[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
      var property = _step.value;

      if (obj[property] == null || obj[property] == undefined) {
        return false;
      }
    }
  } catch (err) {
    _didIteratorError = true;
    _iteratorError = err;
  } finally {
    try {
      if (!_iteratorNormalCompletion && _iterator.return) {
        _iterator.return();
      }
    } finally {
      if (_didIteratorError) {
        throw _iteratorError;
      }
    }
  }

  return true;
}
/**
 * 
 * @param {Object} obj
 */

function isEmptyObject(obj) {
  for (var item in obj) {
    return false;
  }
  return true;
}

function getFilePath(filePath) {
  var index = filePath.indexOf("public");
  if (index > -1) {
    return filePath.substr(index, filePath.length);
  } else {
    return false;
  }
}

/**
 * 
 * @param {Array} arr 
 * @param {String} key 
 * @returns {Array} 
 */
function matchDownloadUrl(arr, key) {
  return arr.map(function (elt) {
    if (elt[key]) {
      elt[key] = ROOT_URL + '/' + elt[key];
    }
    if (elt.children && elt.children.length > 0) {
      elt.children = matchDownloadUrl(elt.children, key);
    }
    return elt;
  });
}

function matchDownloadUrlByStr(value) {
  return ROOT_URL + '/' + value;
}

function deleteReqFiles(req) {
  if (req.files && req.files.length > 0) {

    for (var i in req.files) {
      var file = req.files[i];
      deleteFile(file.path);
    }
  }
}