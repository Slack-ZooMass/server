var express = require('express');
var url = require('url');
var generator = require('../lib/generator');
var router = express.Router();

/* GET a playlist by keyword*/
router.post('/with-words', function(req, res, next) {
    var words = req.body.words;
    var access_token = req.body.access_token;
    var user_id = req.body.user_id;
    generator.getPlaylistFromWords(words, access_token, user_id, function(response) {
        res.send(response);
    });
});

module.exports = router;
