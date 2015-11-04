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
  var access_token = req.body.access_token;
  var user_id = req.body.user_id;

  api.createPlaylistFromWords(words, access_token, user_id, function(playlistID) {
    res.send(playlistID);
  });
});

router.post('/with-images',  upload.single('images_file'), function(req, res, next) {
  var access_token = req.body.access_token;
  var user_id = req.body.user_id

  var images_file = fs.createReadStream(req.file.path);
  if(!images_file) {
    return next({ error:'The photo album zip file is not found.  Please try again.', code:404});
  }
  else {
    api.createPlaylistFromImages(images_file, access_token, user_id, function(playlistID) {
      res.send(playlistID);
    });
  }
});


module.exports = router;
