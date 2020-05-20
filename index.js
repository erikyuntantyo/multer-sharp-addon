const fs = require('fs');
const sharp = require('sharp');

function getDestination (req, file, cb) {
  cb(null, '/dev/null');
}
function getFilename (req, file, cb) {
  cb(null, 'filename.ext');
}

function MulterSharp (opts) {
  this.storage = opts.storage;
  this.getDestination = (opts.destination || getDestination);
  this.getFilename = (opts.filename || getFilename);
  this.size = opts.size || 512
  this.s3 = opts.s3
  this.folder = opts.folder
}

MulterSharp.prototype._handleFile = function _handleFile (req, file, cb) {
  const self = this;
  const resizer = sharp().resize(this.size, null, { withoutEnlargement: true });

  this.getDestination(req, file, function (err, path) {
    if (err) return cb(err);

    self.getFilename(req, file, function (err, filename) {
      if (err) return cb(err);

      if(self.s3){
        const uploadParams = {ContentType: file.mimetype, ACL: 'public-read', Bucket: 'cdas-epayment', Key: '', Body: ''};
        const fileStream = file.mimetype.includes('image') ? file.stream.pipe(resizer) : file.stream;
        uploadParams.Body = fileStream;
        uploadParams.Key = path+filename;

        self.s3.upload (uploadParams, function (err, data) {
          if (err) {
            cb
          } if (data) {
            cb(null, {
              filename,
              path: data.Location,
              size: 123
            });
          }
        })
        
      } else {
        
        const outStream = fs.createWriteStream(path + filename);

        file.mimetype.includes('image') ? file.stream.pipe(resizer).pipe(outStream) : file.stream.pipe(outStream);
        
        outStream.on('error', cb);
        outStream.on('finish', function () {
          cb(null, {
            filename,
            path: path + filename,
            size: outStream.bytesWritten
          });
        });
      }
    });
  });
};

MulterSharp.prototype._removeFile = function _removeFile (req, file, cb) {
  fs.unlink(file.path, cb);
};

module.exports = function (opts) {
  return new MulterSharp(opts);
};