var express = require('express');
var url = require('url');
var generator = require('../lib/generator');
var router = express.Router();

/* GET a playlist by keyword*/
router.post('/with-words', function(req, res, next) {
    var words = req.body.words;
    generator.getPlaylistFromWords(words, function(response) {
        res.send(response);
    });
});

module.exports = router;
