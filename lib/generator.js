var exports = module.exports = {};
var spotify = require('../spotify'); // change to ../lib/spotify when Ryan makes the change
var https = require('https');

exports.getPlaylistFromWords = function(words, callback) {
    var word = words[0];
    word = word.replace(" ","+");
    spotify.getPlaylist(word, callback);
};
