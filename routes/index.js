var express = require('express');
var router = express.Router();
var querystring = require('querystring');
var spotify = require('../lib/spotify.js');

router.get('/', function(req, res, next) {
  spotify.getPlaylist('dogs', function(data){
    res.render('index', { title: data });
  });
});

router.get('/login', function(req, res, next) {
  var query = {
    client_id : process.env.CLIENT_ID,
    response_type : 'code',
    redirect_uri : 'http://localhost:3000/callback',
    scope : 'playlist-modify-public'
  }
  res.redirect('https://accounts.spotify.com/authorize?' + querystring.stringify(query));
});

router.get('/callback', function(req, res, next) {
  var error = req.query.error
  if(error){
    res.render('index', { title : error });
  }

  var code = req.query.code;
  var authenticationInformation = {grant_type: 'authorization_code', code: code, redirect_uri: 'http://localhost:3000/callback'};
  spotify.requestToken(authenticationInformation, function(access_token){
    var playlist = { ownerID: 'songgen', playlistName: 'SUCK IT SPOTIFY!'};
    spotify.createPlaylist(playlist, access_token, function(data){
      var playlist = { ownerID: 'songgen', playlistID: '1gijkE1Nx8hSCHP31Ai0Fc' };
      var tracks = [ 'spotify:track:6rqhFgbbKwnb9MLmUQDhG6', 'spotify:track:383QXk8nb2YrARMUwDdjQS' ]
      spotify.addToPlaylist(playlist, tracks, access_token, function(data){
        res.render('index', { title: access_token });
      });
    });
  });
});

module.exports = router;
