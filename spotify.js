var exports = module.exports = {};
var https = require('https');

function encode(string){
    return new Buffer(string).toString('base64');
}

function authorize(callback){
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

// given a JSON playlist = { ownerID: "...", playlistID: "..." }
exports.getTrackList = function(playlist, callback){
    authorize(function(access_token){
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
            console.log(data);
            callback(data);
        });
    });
}

exports.getPlaylist = function(word, callback){
    var options = {
        host : 'api.spotify.com',
        method : 'GET',
        path : '/v1//search?type=playlist&limit=1&q=' + word,
        headers : headers
    };
    makeRequest(options, function(data){
        console.log(data);
        callback(data);
    });
};

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
            resBody = JSON.parse(resBody);
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
