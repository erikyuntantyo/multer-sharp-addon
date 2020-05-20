## multer-sharp-addon
Multer storage engine with resize image function before save the uploaded file.

Support S3 or Disk Storage as destination

### TODO

- [x] Auto resize image before upload
- [ ] Auto create thumbnail
- [ ] Config width & height for resizing (now only height that supported)
- [ ] Add test 


### Installation

`npm install multer-sharp-addon` atau `yarn add multer-sharp-addon`

### How to Use
```js
const multerSharp = require('multer-sharp-addon')
```

#### Disk storage
```js
const confStorage = {
  destination(req, file, cb) {
    cb(null, `path/to/destination/`);
  },
  filename(req, file, cb) {
    cb(
      null,
      `${Date.now()}-${file.originalname}`
    );
  }
}

const storage = multerSharp(confStorage);
const upload = multer({ storage });
```

#### S3 storage
```js
const s3 = new AWS.S3({apiVersion: '2006-03-01'});
const confStorage = {
  s3,
  destination(req, file, cb) {
    cb(null, `s3-folder/`);
  },
  filename(req, file, cb) {
    cb(
      null,
      `${Date.now()}-${file.originalname}`
    );
  }
}

const storage = multerSharp(confStorage);
const upload = multer({ storage });
```



### License

[MIT](https://github.com/apriady/nodejs-bca-scraper/blob/master/LICENSE)

### Author

[Achmad Apriady](mailto:achmad.apriady@gmail.com)