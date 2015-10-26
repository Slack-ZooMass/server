var express = require('express');
var router = express.Router();
var querystring = require('querystring');
var spotify = require('../lib/spotify.js');
var generator = require('../lib/generator');
var url = require('url');
var extend = require('util')._extend;
var bluemix = require('../lib/bluemix.js');
var watson = require('watson-developer-cloud');
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

// README
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
  console.log(authenticationInformation);
  spotify.requestToken(authenticationInformation, function(data){
    console.log(data);
    res.cookie('access_token', data.access_token);
    res.render('query');
  });
});

router.get('/generateAndRedirect', function(req, res, next) {
  var access_token = req.cookies.access_token;
  spotify.getMe(access_token, function(data){
    var user_id = data.id;

    if(user_id === undefined){ // token has expired
        res.redirect('/');
    }
    else{
      var words = req.query.words.split(' ');
      generator.getPlaylistFromWords(words, access_token, user_id, function(response) {
          res.redirect('http://open.spotify.com/user/' + user_id + '/playlist/' + response);
      });
    }
  });
});

router.get('/zip', function(req, res, next) {
  var access_token = req.cookies.access_token
  spotify.getMe(access_token, function(data){
    var user_id = data.id;

    if(user_id === undefined){ // token has expired
      res.render('index', { title: data });
    }
    else{
      res.render('zip-upload-testing.hbs');
    }
  });
});

// if bluemix credentials exists, then override local
var credentials = extend({
  username: '0e8ac13c-e154-4cf8-be34-4f88ca9cac47',
  password: 'tFYIUlzIFylf',
  version: 'v1'
}, bluemix.getServiceCreds('visual_insights')); // VCAP_SERVICES

// wrapper
var visual_insights = watson.visual_insights(credentials);

router.post('/generateAndRedirectFromZip', upload.single('images_file'), function(req, res, next) {
  var access_token = req.cookies.access_token;
  spotify.getMe(access_token, function(data){
    var user_id = data.id;

    if(user_id === undefined){ // token has expired
        res.redirect('/');
    }
    else{
      var images_file = fs.createReadStream(req.file.path);
      if (!images_file)
          return next({ error:'The photo album zip file is not found.  Please try again.', code:404});

      visual_insights.summary({images_file: images_file}, function (err, result) {
        if (err){
            next(err);
        } else {
            var descriptors = result.summary;
            generator.getPlaylistFromDescriptors(descriptors, access_token, user_id, function(response) {
              res.redirect('http://open.spotify.com/user/' + user_id + '/playlist/' + response);
            });
        }
      });
    }
  });
});

module.exports = router;
