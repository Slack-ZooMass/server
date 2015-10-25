var express = require('express');
var router = express.Router();
var querystring = require('querystring');
var spotify = require('../lib/spotify.js');
var generator = require('../lib/generator');

// README
router.get('/', function(req, res, next) {
  var access_token = req.cookies.access_token;
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
  var query = {
    client_id : process.env.CLIENT_ID,
    response_type : 'code',
    redirect_uri : 'https://still-inlet-8239.herokuapp.com/callback',
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

  var code = req.query.code;
  var authenticationInformation = {grant_type: 'authorization_code', code: code, redirect_uri: 'https://still-inlet-8239.herokuapp.com/callback'};
  spotify.requestToken(authenticationInformation, function(data){
    console.log(data.access_token);
    res.cookie('access_token', data.access_token);
    res.render('query')
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

module.exports = router;
