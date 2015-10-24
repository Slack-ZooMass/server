var exports = module.exports = {};
var https = require('https');

var defaultOptions = {
    host : 'api.spotify.com',
    port : 443,
    path : '/v1'
};

exports.getPlaylist = function(word, callback){
    //clone default options
    var options = JSON.parse(JSON.stringify(defaultOptions));
    options.method = 'GET';
    options.path += '/search?type=playlist&limit=1&q=';
    options.path += word;
    makeRequest(options, callback);
};

// given an options JSON, make a request
function makeRequest(options, callback) {
    var response;
    var req = https.request(options, function(res) {
        res.on('data', function(d) {
            callback(d); // execute call back to serve the data as the response
        });
    });
    req.end();
    req.on('error', function(e) {
        console.error(e);
    });
}
