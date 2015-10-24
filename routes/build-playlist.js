var express = require('express');
var url = require('url');
var router = express.Router();

/* GET a playlist by keyword*/
router.get('/with-words', function(req, res, next) {
    var url_parts = url.parse(req.url, true);
    var query = url_parts.query.words;

    // TODO: This response is just filler. We need to determine a meaningful response
    res.send(query);
});

module.exports = router;
