var exports = module.exports = {};
var https = require('https');

var defaultOptions = {
    host : 'api.spotify.com',
    port : 443,
    path : '/v1'
};

exports.getPlaylist = function(word){
    //clone default options
    var options = JSON.parse(JSON.stringify(defaultOptions));
    options.method = 'GET';
    options.path += '/search?type=playlist&limit=1&q=';
    options.path += word;
    makeRequest(options);
}

// given an options JSON, make a request
function makeRequest(options) {
  var response;

  var req = https.request(options, function(res) {
      console.log("statusCode: ", res.statusCode);
      console.log("headers: ", res.headers);

      res.on('data', function(d) {
          console.info('GET result:\n');
          process.stdout.write(d);
          response = res;
          console.info('\n\nCall completed');
      });

  });

  req.end();
  req.on('error', function(e) {
      console.error(e);
  });

  return response;
}
