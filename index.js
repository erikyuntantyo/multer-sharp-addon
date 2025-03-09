import fs from 'fs'
import sharp from 'sharp'

function getDestination(req, file, cb) {
  cb(null, '/dev/null')
}

function getFilename (req, file, cb) {
  cb(null, 'filename.ext')
}

function MulterSharp (opts) {
  this.storage = opts.storage
  this.getDestination = opts.destination || getDestination
  this.getFilename = opts.filename || getFilename
  this.size = opts.size || 512
  this.s3 = opts.s3
  this.folder = opts.folder
}

MulterSharp.prototype._handleFile = function _handleFile (req, file, cb) {
  const resizer = sharp().resize({ width: this.size, fit: 'inside' })

  this.getDestination(req, file, (err, path) => {
    if (err) return cb(err)

    this.getFilename(req, file, (err, filename) => {
      if (err) return cb(err)

      if (this.s3) {
        const uploadParams = {
          ContentType: file.mimetype,
          ACL: 'public-read',
          Bucket: 'cdas-epayment',
          Key: '',
          Body: '',
        }

        const fileStream = file.mimetype.includes('image')
          ? file.stream.pipe(resizer)
          : file.stream

        uploadParams.Body = fileStream
        uploadParams.Key = path + filename

        this.s3.upload(uploadParams, (err, data) => {
          if (err) {
            return cb(err)
          }

          cb(null, {
            filename,
            path: data.Location,
            size: 123 // Consider using actual file size
          })
        })
      } else {
        const outStream = fs.createWriteStream(path + filename)
        const processedStream = file.mimetype.includes('image')
          ? file.stream.pipe(resizer)
          : file.stream

        processedStream.pipe(outStream)

        outStream.on('error', cb)
        outStream.on('finish', () => {
          cb(null, {
            filename,
            path: path + filename,
            size: outStream.bytesWritten,
          })
        })
      }
    })
  })
}

MulterSharp.prototype._removeFile = (req, file, cb) => {
  fs.unlink(file.path, cb)
}

export default (opts) => {
  return new MulterSharp(opts)
}
