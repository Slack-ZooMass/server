var express = require('express');
var router = express.Router();
var querystring = require('querystring');
var spotify = require('../lib/spotify');
var api = require('../lib/api');
var url = require('url');

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

// Either login or query
router.get('/', function(req, res, next) {
  var access_token = req.cookies.access_token
  spotify.getMe(access_token, function(data){
    var user_id = data.id;

    if(user_id === undefined){ // token has expired
      res.render('index', { title: data });
    }
    else{
      res.render('query');
    }
  });
});

// authenticate with spotify
router.get('/login', function(req, res, next) {

  var hostname = req.headers.host; // hostname = 'localhost:8080'
  var pathname = 'http://'+hostname+'/callback'; // pathname = '/MyApp'

  var query = {
    client_id : process.env.CLIENT_ID,
    response_type : 'code',
    redirect_uri : pathname,
    scope : 'playlist-modify-public'
  }
  res.redirect('https://accounts.spotify.com/authorize?' + querystring.stringify(query));
});

// get authentication token and save to cookie
router.get('/callback', function(req, res, next) {
  var error = req.query.error
  if(error){
    res.render('index', { title : error });
  }

  var hostname = req.headers.host; // hostname = 'localhost:8080'
  var pathname = 'http://'+hostname+'/callback'; // pathname = '/MyApp'

  var code = req.query.code;
  var authenticationInformation = {grant_type: 'authorization_code', code: code, redirect_uri: pathname};
  spotify.requestToken(authenticationInformation, function(data){
    res.cookie('access_token', data.access_token);
    res.render('query');
  });
});

// create and go to a spotify playlist
router.post('/generateAndRedirect', upload.single('images_file'), function(req, res, next) {
  var access_token = req.cookies.access_token;
  spotify.getMe(access_token, function(data){
    var user_id = data.id;

    if(user_id === undefined){ // token has expired
        res.redirect('/');
    }
    else{
      var words = req.body.words;
      var file = req.file;

      if(words){
        var words = words.split(' ');
        api.createPlaylistFromWords(words, access_token, user_id, function(playlistID) {
            res.redirect('http://open.spotify.com/user/' + user_id + '/playlist/' + playlistID);
        });
      }
      if(file){
        var images_file = fs.createReadStream(file.path);
        if(images_file){
          api.createPlaylistFromImages(images_file, access_token, user_id, function(playlistID) {
              res.redirect('http://open.spotify.com/user/' + user_id + '/playlist/' + playlistID);
          });
        }
      }
    }
  });
});

module.exports = router;
