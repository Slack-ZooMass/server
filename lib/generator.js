var exports = module.exports = {};
var spotify = require('../lib/spotify');
var https = require('https');

// given an array of descriptors
exports.getPlaylistFromDescriptors = function(descriptors, access_token, owner_id, callback) {
  var playlist = {
    owner_id : owner_id,
    playlist_name : descriptors[0].name + ' Mix'
  }
  spotify.createPlaylist(playlist, access_token, function(data) {
    playlist.playlist_id = data.id;

    //this can be done asyncronously without penalty
    descriptors.sort(function(a, b) {
      return b.score - a.score;
    });
    descriptors.slice(0, 10).forEach(function(descriptor) {
      descriptor = descriptor.name.split('/');
      getTracksFromWord(descriptor[descriptor.length-1], function(tracks) {
        spotify.addToPlaylist(playlist, tracks, access_token);
      });
    });

    callback(playlist.playlist_id);
  })
}

// given an array words = [ '...', '...', ... ]
exports.getPlaylistFromWords = function(words, access_token, owner_id, callback) {
  if(words) {
    words = words.filter(function(v){return v!==''});
    var playlist = {
      owner_id : owner_id,
      playlist_name : words[0] + ' Mix'
    }
    spotify.createPlaylist(playlist, access_token, function(data) {
      playlist.playlist_id = data.id;

      // this can be done asyncronously without penalty
      words.forEach(function(word) {
        getTracksFromWord(word, function(tracks) {
          spotify.addToPlaylist(playlist, tracks, access_token);
        });
      });

      callback(playlist.playlist_id);
    });
  }
}

function getTracksFromWord(word, callback) {
  spotify.getPlaylist(word, function(data) {
    if(data.playlists && data.playlists.items.length > 0) {
      var playlist = {
        owner_id : data.playlists.items[0].owner.id,
        playlist_id : data.playlists.items[0].id
      };
      spotify.getTrackList(playlist, function(data) {
        // how many are we grabbing
        var queried_tracks = data.items;
        if(queried_tracks.length < 5) {
          grab_size = queried_tracks.length;
        }
        else {
          grab_size = 5;
        }

        //grab only the uri's
        var chosen_tracks = [];
        for(var i=0; i<grab_size; i++) {
          chosen_tracks.push(queried_tracks[i].track.uri);
        }
        callback(chosen_tracks);
      });
    }
  });
}

//
// PSEUDO-Algorithm #1
//
//  var playlist = createPlaylist(topWord + ' Mix')
//  var tracks = []
//  for each word {
//    var playlist = getPlaylist(word)
//    var tracks = getTrackList(playlist)
//    tracks.trim(5)
//    addToPlaylist(playlist, tracks)
//  }
//  return playslist
//
