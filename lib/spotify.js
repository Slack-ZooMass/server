var exports = module.exports = {};
var https = require('https');

function encode(string){
    return new Buffer(string).toString('base64');
}

// used for calls that do not require user information
function requestClientAccessToken(callback){
    var body = 'grant_type=client_credentials';
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
    makeRequest(options, function(data){
        var access_token = data.access_token;
        callback(access_token);
    }, body);
}

exports.getPlaylist = function(word, callback){
    requestClientAccessToken(function(access_token){
        var headers = {
            'Authorization' : 'Bearer ' + access_token,
            'Content-Type' : 'application/json'
        };
        var options = {
            host : 'api.spotify.com',
            method : 'GET',
            path : '/v1/search?type=playlist&limit=1&q=' + word,
            headers : headers
        };
        makeRequest(options, function(data){
            callback(data);
        });
    });
};

// given a JSON playlist = { ownerID: '...', playlistID: '...' }
exports.getTrackList = function(playlist, callback){
    requestClientAccessToken(function(access_token){
        var headers = {
            'Authorization' : 'Bearer ' + access_token,
            'Content-Type' : 'application/json'
        };
        var options = {
            host : 'api.spotify.com',
            method : 'GET',
            path : '/v1/users/' + playlist.ownerID + '/playlists/' + playlist.playlistID + '/tracks?market=ES',
            headers : headers
        };
        makeRequest(options, function(data){
            callback(data);
        });
    });
}

// given a JSON playlist = { ownerID: '...', playlistName: '...'}
// and an access_token from spotify (front-end)
exports.createPlaylist = function(playlist, access_token, callback){
    var body = '{"name": "' + playlist.playlistName + '", "public": true}';
    var headers = {
        'Authorization' : 'Bearer ' + access_token,
        'Content-Type' : 'application/json',
        'Content-Length' : Buffer.byteLength(body, 'utf8')
    };
    var options = {
        host : 'api.spotify.com',
        method : 'POST',
        path : '/v1/users/' + playlist.ownerID + '/playlists',
        headers : headers
    };
    makeRequest(options, function(data){
        callback(data);
    }, body);
}

// given a JSON playlist = { ownerID: '...', playlistID: '...'}
// and an array tracks = [ 'spotify:track:uri', ... ]
// and an access_token from spotify (front-end)
exports.addToPlaylist = function(playlist, tracks, access_token, callback){
    var encodedTracks = '';
    tracks.forEach(function(uri){
        encodedTracks += querystring.escape(uri) + ',';
    });
    var headers = {
        'Authorization' : 'Bearer ' + access_token,
        'Content-Type' : 'application/json'
    };
    var options = {
        host : 'api.spotify.com',
        method : 'POST',
        path : '/v1/users/' + playlist.ownerID + '/playlists/' + playlist.playlistID + '/tracks?uris=' + encodedTracks,
        headers : headers
    };
    makeRequest(options, function(data){
        callback(data);
    });
}

// given an options JSON, make a request
function makeRequest(options, callback, reqBody) {
    var req = https.request(options, function(res) {
        var resBody = '';

        // add each data chunk
        res.on('data', function(data) {
            data = data.toString("utf-8"); // read the Buffer
            resBody += data
        });

        res.on('end', function() {
            if(resBody){
                resBody = JSON.parse(resBody);
            }
            callback(resBody);
        });
    });

    // send request body if it exists
    if(reqBody !== undefined){
        req.write(reqBody);
    }

    req.end();
    req.on('error', function(e) {
        console.error(e);
    });
}
