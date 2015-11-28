var exports = module.exports = {};
var https = require('https');
var querystring = require('querystring');

function encode(string){
  return new Buffer(string).toString('base64');
}

// for calls that do not require user information, authentication_information = {grant_type: 'client_credentials'}
// for calls that require user information, authentication_information =
//    {grant_type: 'authorization_code', code: '...', redirect_uri: 'http://localhost:3000/callback'}
exports.requestToken = function(authentication_information, callback) {
  var body = 'grant_type=' + authentication_information.grant_type;
  switch (authentication_information.grant_type) {
    case 'authorization_code':
      body += '&code=' + authentication_information.code + '&redirect_uri=' + authentication_information.redirect_uri;
      break;
    case 'refresh_token':
      body += '&refresh_token=' + authentication_information.refresh_token;
      break;
  }
  var headers = {
    'Authorization' : 'Basic ' + encode(process.env.CLIENT_ID + ':' + process.env.CLIENT_SECRET),
    'Content-Type' : 'application/x-www-form-urlencoded',
    'Content-Length' : Buffer.byteLength(body, 'utf8')
  };
  var options = {
    host : 'accounts.spotify.com',
    method: 'POST',
    path : '/api/token',
    headers : headers
  };
  makeRequest(options, function(data) {
    if(callback) {
      callback(data);
    }
  }, body);
}

exports.getPlaylist = function(string, callback) {
  exports.requestToken({grant_type: 'client_credentials'}, function(data) {
    var headers = {
      'Authorization' : 'Bearer ' + data.access_token,
      'Content-Type' : 'application/json'
    };
    var options = {
      host : 'api.spotify.com',
      method : 'GET',
      path : '/v1/search?type=playlist&limit=1&q=' + querystring.escape(string),
      headers : headers
    };
    makeRequest(options, function(data) {
      if(callback) {
        callback(data);
      }
    });
  });
}

// given a JSON playlist = { owner_id: '...', playlist_id: '...' }
exports.getTrackList = function(playlist, callback) {
  exports.requestToken({grant_type: 'client_credentials'}, function(data) {
    var headers = {
      'Authorization' : 'Bearer ' + data.access_token,
      'Content-Type' : 'application/json'
    };
    var options = {
      host : 'api.spotify.com',
      method : 'GET',
      path : '/v1/users/' + playlist.owner_id + '/playlists/' + playlist.playlist_id + '/tracks?market=ES',
      headers : headers
    };
    makeRequest(options, function(data) {
      if(callback) {
        callback(data);
      }
    });
  });
}

// given a JSON playlist = { owner_id: '...', playlist_name: '...'}
// and an access_token from spotify (front-end)
exports.createPlaylist = function(playlist, access_token, callback) {
  var body = '{"name": "' + playlist.playlist_name + '", "public": true}';
  var headers = {
    'Authorization' : 'Bearer ' + access_token,
    'Content-Type' : 'application/json',
    'Content-Length' : Buffer.byteLength(body, 'utf8')
  };
  var options = {
    host : 'api.spotify.com',
    method : 'POST',
    path : '/v1/users/' + playlist.owner_id + '/playlists',
    headers : headers
  };
  makeRequest(options, function(data) {
    if(callback) {
      callback(data);
    }
  }, body);
}

// given a JSON playlist = { owner_id: '...', playlist_id: '...'}
// and an array tracks = [ 'spotify:track:uri', ... ]
// and an access_token from spotify (front-end)
exports.addToPlaylist = function(playlist, tracks, access_token, callback) {
  var encodedTracks = '';
  tracks.forEach(function(uri) {
    encodedTracks += querystring.escape(uri) + ',';
  });
  var headers = {
    'Authorization' : 'Bearer ' + access_token,
    'Content-Type' : 'application/json'
  };
  var options = {
    host : 'api.spotify.com',
    method : 'POST',
    path : '/v1/users/' + playlist.owner_id + '/playlists/' + playlist.playlist_id + '/tracks?uris=' + encodedTracks,
    headers : headers
  };
  makeRequest(options, function(data) {
    if(callback) {
      callback(data);
    }
  });
}

exports.getMe = function(access_token, callback) {
  var headers = {
    'Authorization' : 'Bearer ' + access_token,
    'Content-Type' : 'application/json'
  };
  var options = {
    host : 'api.spotify.com',
    method : 'GET',
    path : '/v1/me',
    headers : headers
  };
  makeRequest(options, function(data) {
    callback(data);
  });
}

// given an options JSON, make a request
function makeRequest(options, callback, req_body) {
  var req = https.request(options, function(res) {
    var res_body = '';

    // add each data chunk
    res.on('data', function(data) {
      data = data.toString("utf-8"); // read the Buffer
      res_body += data
    });

    res.on('end', function() {
      if(res_body) {
        res_body = JSON.parse(res_body);
      }
      callback(res_body);
    });
  });

  // send request body if it exists
  if(req_body !== undefined) {
    req.write(req_body);
  }

  req.end();
  req.on('error', function(e) {
    console.error(e);
  });
}
