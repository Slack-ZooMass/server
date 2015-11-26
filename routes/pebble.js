var express = require('express');
var router = express.Router();
var querystring = require('querystring');
var spotify = require('../lib/spotify');
var api = require('../lib/api');

// either login or query
router.get('/', function(req, res, next) {
  res.render('pebble-index');
});

// authenticate with spotify
router.get('/login', function(req, res, next) {

  var hostname = req.headers.host; // hostname = 'localhost:8080'
  var pathname = 'http://'+hostname+'/pebble/callback'; // pathname = '/MyApp'

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
  if(error) {
    res.render('index', { title : error });
  }

  var hostname = req.headers.host; // hostname = 'localhost:8080'
  var pathname = 'http://'+hostname+'/pebble/callback'; // pathname = '/MyApp'

  var code = req.query.code;
  var authenticationInformation = {grant_type: 'authorization_code', code: code, redirect_uri: pathname};
  spotify.requestToken(authenticationInformation, function(data) {

    var config_settings = {
      access_token : data.access_token,
      refresh_token : data.refresh_token
    }

    // set the return URL depending on the runtime environment
    var return_to = req.query.return_to || 'pebblejs://close#';
    res.redirect(return_to + encodeURIComponent(JSON.stringify(config_settings)));
  });
});

module.exports = router;
