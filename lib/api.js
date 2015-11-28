var exports = module.exports = {};
var generator = require('../lib/generator');
var spotify = require('../lib/spotify');
var extend = require('util')._extend;
var bluemix = require('../lib/bluemix.js');
var watson = require('watson-developer-cloud');

// if bluemix credentials exists, then override local
var bluemix_credentials = extend({
  username: '0e8ac13c-e154-4cf8-be34-4f88ca9cac47',
  password: 'tFYIUlzIFylf',
  version: 'v1'
}, bluemix.getServiceCreds('visual_insights')); // VCAP_SERVICES

// wrapper
var visual_insights = watson.visual_insights(bluemix_credentials);

/**
 * Callback for returning the playlist ID and new credentials if acquired.
 *
 * @callback playlistCallback
 * @param {Object} response - Object containing spotify playlist's ID and new credentials if acquired.
 * @param {string} response.playlistID - A spotify playlist's ID.
 * @param {string} response.access_token - The user's access token for spotify.
 * @param {string} response.refresh_token - The user's refresh token for spotify.
 */

/**
 * Creates a new Playlist from a list of words.
 *
 * @param {array} words - The words to be converted into a playlist.
 * @param {Object} credentials - The user's access information for spotify.
 * @param {string} credentials.access_token - The user's access token for spotify.
 * @param {string} credentials.refresh_token - The user's refresh token for spotify.
 * @param {playlistCallback} callback - Calls the callback with the playlist id and possibly new credentials.
 */
exports.createPlaylistFromWords = function(words, credentials, callback) {
  createPlaylist(generator.getPlaylistFromWords, words, credentials, callback);
}

/**
 * Creates a new Playlist from a list of images.
 *
 * @param {zip} images_file - The images, compressed, to be converted into a playlist.
 * @param {Object} credentials - The user's access information for spotify.
 * @param {string} credentials.access_token - The user's access token for spotify.
 * @param {string} credentials.refresh_token - The user's refresh token for spotify.
 * @param {playlistCallback} callback - Calls the callback with the playlist id and possibly new credentials.
 */
exports.createPlaylistFromImages = function(images_file, credentials, callback) {
  visual_insights.summary({images_file: images_file}, function(err, result) {
    if(err) {
      next(err);
    }
    else {
      var descriptors = result.summary;
      createPlaylist(generator.getPlaylistFromDescriptors, descriptors, credentials, callback);
    }
  });
}

/**
 * Creates a new Playlist using the specified generator function and a list of words.
 *
 * @param {function} generatorFunction - The function to call to generate a playlist.
 * @param {array} words - The words to be converted into a playlist.
 * @param {Object} credentials - The user's access information for spotify.
 * @param {string} credentials.access_token - The user's access token for spotify.
 * @param {string} credentials.refresh_token - The user's refresh token for spotify.
 * @param {playlistCallback} callback - Calls the callback with the playlist id and possibly new credentials.
 */
function createPlaylist(generatorFunction, words, credentials, callback) {
  var access_token = credentials.access_token;
  var refresh_token = credentials.refresh_token;

  spotify.getMe(access_token, function(data) {
    var user_id = data.id;

    if (user_id === undefined) { // token has expired
      spotify.requestToken({grant_type: 'refresh_token', refresh_token : refresh_token}, function(new_credentials) {
        generatorFunction(words, new_credentials.access_token, user_id, function(playlistID) {
          var response = {
            playlistID : playlistID,
            access_token : new_credentials.access_token,
            refresh_token : new_credentials.refresh_token
          }

          callback(response);
        });
      });
    } else {
      generatorFunction(words, access_token, user_id, function(playlistID) {
        var response = {
          playlistID : playlistID
        }

        callback(response);
      });
    }
  });
}
