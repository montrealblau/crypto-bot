const fs = require('fs');
exports.getFile = (url) => {
    return new Promise(function(resolve, reject) {
        fs.readFile(url,'utf8',function(err, data) {
            if (err) { return resolve(false); }
            return resolve(data);
        });
    });
}


exports.postFile = (url,str) => {
    return new Promise(function(resolve, reject) {
        fs.writeFile(url,str,'utf8',function(err, data) {
            if (err) { return reject(err); }
            return resolve('completed postFile');
        });
    });
}


exports.exists = (url) => {
    return new Promise(function(resolve, reject) {
        fs.exists(url,function(exists) {
            if (exists) { return resolve(true); }
            return resolve(false);
        });
    });
}