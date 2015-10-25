var exports = module.exports = {};
var spotify = require('../lib/spotify');
var https = require('https');

// given an array words = [ '...', '...', ... ]
exports.getPlaylistFromWords = function(words, access_token, ownerID, callback){
    var playlist = {
        ownerID : ownerID,
        playlistName : words[0] + ' Mix'
    }
    spotify.createPlaylist(playlist, access_token, function(data){
        playlist.playlistID = data.id;

        // this can be done asyncronously without penalty
        words.forEach(function(word){
            getTracksFromWord(word, function(tracks){
                spotify.addToPlaylist(playlist, tracks, access_token);
            });
        });

        callback(playlist.playlistID);
    });
}

function getTracksFromWord(word, callback){
    spotify.getPlaylist(word, function(data){
          if(data.playlists.items.length > 0){
              var playlist = {
                  ownerID : data.playlists.items[0].owner.id,
                  playlistID : data.playlists.items[0].id
              };
              spotify.getTrackList(playlist, function(data){
                  // how many are we grabbing
                  var queriedTracks = data.items;
                  if(queriedTracks.length < 5)
                      grabSize = queriedTracks.length;
                  else
                      grabSize = 5;

                  //grab only the uri's
                  var chosenTracks = [];
                  for(var i=0; i<grabSize; i++){
                      chosenTracks.push(queriedTracks[i].track.uri);
                  }
                  callback(chosenTracks);
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
