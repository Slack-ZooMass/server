var express = require('express');
var url = require('url');
var generator = require('../lib/generator');
var router = express.Router();
var extend = require('util')._extend;
var bluemix = require('../lib/bluemix.js');
var watson = require('watson-developer-cloud');
var fs = require('fs');

/* GET a playlist by keyword*/
router.post('/with-words', function(req, res, next) {
    var words = req.body.words;
    var access_token = req.body.access_token;
    var user_id = req.body.user_id;

    generator.getPlaylistFromWords(words, access_token, user_id, function(response) {
        res.send(response);
    });
});

// if bluemix credentials exists, then override local
var credentials = extend({
  username: '0e8ac13c-e154-4cf8-be34-4f88ca9cac47',
  password: 'tFYIUlzIFylf',
  version: 'v1'
}, bluemix.getServiceCreds('visual_insights')); // VCAP_SERVICES

// wrapper
var visual_insights = watson.visual_insights(credentials);

/* GET a playlist by keyword*/
router.post('/with-images', function(req, res, next) {
    var words = req.body.words;
    var access_token = req.body.access_token;
    var user_id = req.body.user_id;
    var images_file = fs.createReadStream('./dank_memes.zip');
    if (!images_file)
        return res.status(404).json({error:'The photo album zip file is not found.  Please try again.', code:404});

    visual_insights.summary({images_file: images_file}, function (err, result) {
        if (err){
            return next(err);
        }
        else{
            res.json(result);
            // generator.getPlaylistFromWords(words, access_token, user_id, function(response) {
            //     res.send(response);
            // });
        }
    });
});

module.exports = router;
