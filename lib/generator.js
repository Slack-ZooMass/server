var exports = module.exports = {};
var spotify = require('../lib/spotify');
var https = require('https');

// given an array words = [ '...', '...', ... ]
exports.getPlaylistFromWords = function(words, access_token, ownerID, callback) {
    var tracks = [];

    // create a binary array that gets set to 1 once a getTracksFromWord is done
    // when they are all complete, we can create the playlist
    var completed = [];
    for(var i=0; i<words; i++){
        completed[i] = 0;
    }

    words.forEach(function(word){
        getTracksFromWord(word, function(newTracks){
            newTracks.forEach(function(newTrack){
                tracks.push(newTrack);
            })
            completed[words.indexOf(word)] = 1;
            if(completed.indexOf(0) === -1){
                var playlist = {
                    ownerID : ownerID,
                    playlistName : words[0] + ' Mix'
                }
                createPlaylist(tracks, access_token, playlist, callback);
            }
        });
    });
}

function getTracksFromWord(word, callback){
    spotify.getPlaylist(word, function(data){
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
    });
}

// given a JSON playlist = { ownerID: '...', playlistName: '...'}
function createPlaylist(tracks, access_token, playlist, callback){
    spotify.createPlaylist(playlist, access_token, function(data){
        playlist.playlistID = data.id;
        spotify.addToPlaylist(playlist, tracks, access_token, function(data){
            callback(playlist.playlistID);
        });
    });
}

//
// PSEUDO-Algorithm #1
//
//  var tracks = []
//  for each word {
//    var playlist = getPlaylist(word)
//    var tracks = getTrackList(playlist)
//    for tracks 0 -> 5 {
//      tracks.push(tracks)
//    }
//  }
//  var playlist = createPlaylist(topWord + ' Mix')
//  addToPlaylist(playlist, tracks)
//  return playslist
//
