var express = require('express');
var router = express.Router();
var api = require('../lib/api');
var fs = require('fs');
var multer = require('multer');
var storage = multer.diskStorage({
  destination: function (req, file, callback) {
    callback(null, 'uploads/')
  },
  filename: function (req, file, callback) {
    callback(null, Date.now() + '.zip') //Appending .zip
  }
})
var upload = multer({ storage: storage });

/* GET a playlist by keyword*/
router.post('/with-words', function(req, res, next) {
  var words = req.body.words;
  var credentials = {
    access_token : req.body.access_token,
    refresh_token : req.body.refresh_token
  }

    console.log(req);
    console.log(words);
    console.log(credentials);

  api.createPlaylistFromWords(words, credentials, function(response) {
    console.log('Playlist/Credentials created:', response);
    res.send(response);
  });
});

router.post('/with-images',  upload.single('images_file'), function(req, res, next) {
  var images_file = fs.createReadStream(req.file.path);
  var credentials = {
    access_token : req.body.access_token,
    refresh_token : req.body.refresh_token
  }

  if(!images_file) {
    return next({ error:'The photo album zip file is not found.  Please try again.', code:404});
  }
  else {
    api.createPlaylistFromImages(images_file, credentials, function(response) {
      res.send(response);
    });
  }
});

module.exports = router;
