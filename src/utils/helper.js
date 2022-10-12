const fs = require("fs");
function _fetchFilePath(dir) {
    var results = [];
    fs.readdirSync(dir).forEach(function (file) {
      // console.log("dir:", dir,"file:",file);
      file = dir + "/" + file;
      var stat = fs.statSync(file);
      if (stat && stat.isDirectory()) {
        results = results.concat(_fetchFilePath(file));
      } else {
        results.push(file);
        // console.log("file:", file);
      }
    });
    return results;
  }

  const isObject = function(a) {
    return Object.prototype.toString.call(a) === "[object Object]";
  };
  
  const copyObjectWithSortedKeys = function(object) {
    if (isObject(object)) {
      var newObj = {};
      var keysSorted = Object.keys(object).sort();
      var key;
      for (var i = 0, len = keysSorted.length; i < len; i++) {
        key = keysSorted[i];
        newObj[key] = copyObjectWithSortedKeys(object[key]);
      }
      return newObj;
    } else if (Array.isArray(object)) {
      return object.map(copyObjectWithSortedKeys);
    } else {
      return object;
    }
  };


  


  module.exports = {
    _fetchFilePath,
    copyObjectWithSortedKeys
  };

