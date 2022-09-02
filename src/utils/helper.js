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


  module.exports = {
    _fetchFilePath,
  };

