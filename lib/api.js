var exports = module.exports = {};
var generator = require('../lib/generator');
var extend = require('util')._extend;
var bluemix = require('../lib/bluemix.js');
var watson = require('watson-developer-cloud');

// if bluemix credentials exists, then override local
var credentials = extend({
  username: '0e8ac13c-e154-4cf8-be34-4f88ca9cac47',
  password: 'tFYIUlzIFylf',
  version: 'v1'
}, bluemix.getServiceCreds('visual_insights')); // VCAP_SERVICES

// wrapper
var visual_insights = watson.visual_insights(credentials);

/**
 * Callback for returning the playlist ID.
 *
 * @callback playlistCallback
 * @param {string} playlistID - A spotify playlist's ID.
 */

/**
 * Creates a new Playlist from a list of words.
 *
 * @param {array} words - The words to be converted into a playlist.
 * @param {string} access_token - The user's access token for spotify.
 * @param {string} user_id - The user's spotify id.
 * @param {playlistCallback} callback - Calls the callback with the playlist id.
 */
exports.createPlaylistFromWords = function(words, access_token, user_id, callback) {
  generator.getPlaylistFromWords(words, access_token, user_id, function(response) {
    callback(response);
  });
}

/**
 * Creates a new Playlist from a list of images.
 *
 * @param {zip} images_file - The images, compressed, to be converted into a playlist.
 * @param {string} access_token - The user's access token for spotify.
 * @param {string} user_id - The user's spotify id.
 * @param {playlistCallback} callback - Calls the callback with the playlist id.
 */
exports.createPlaylistFromImages = function(images_file, access_token, user_id, callback) {
  visual_insights.summary({images_file: images_file}, function (err, result) {
  if(err) {
    next(err);
  }
  else {
    var descriptors = result.summary;
    generator.getPlaylistFromDescriptors(descriptors, access_token, user_id, function(response) {
        callback(response);
    });
  }
  });
}
