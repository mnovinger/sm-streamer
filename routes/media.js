var express = require('express');
var router = express.Router();
var fs = require('fs');
var appRoot = require('app-root-path');

const MEDIA_PATH = appRoot+'/media';

/* GET list of movies */
router.get('/', function(req, res, next) {
    fs.readdir(MEDIA_PATH, function (err, files) {
        if (!err) {
            console.log(files);
            res.render('media-list', {title: 'Media List', media: files});
        }
        else
            throw err;
    });
});

router.get('/:file', function(req, res, next) {
    const file = req.params.file;
    res.render('media', {title: file, file: file});
});

router.get('/play/:file', function(req, res, next) {
    const file = MEDIA_PATH + '/' + req.params.file;
    console.log('got it -->'+file+'<---');
    var range = req.headers.range;
    var positions = range.replace(/bytes=/, "").split("-");

    var start = parseInt(positions[0], 10);
    fs.stat(file, function(err, stats) {
        if (err) {
            console.log(err);
            res.send(err);
        }
        var total = stats.size;
        var end = positions[1] ? parseInt(positions[1], 10) : total - 1;
        var chunksize = (end - start) + 1;

        res.writeHead(206, {
            "Content-Range": "bytes " + start + "-" + end + "/" + total,
            "Accept-Ranges": "bytes",
            "Content-Length": chunksize,
            "Content-Type": "video/mp4"
        });

        var stream = fs.createReadStream(file, { start: start, end: end })
            .on("open", function() {
                stream.pipe(res);
            }).on("error", function(err) {
                console.log(err);
                res.end(err);
            });
    });
});



module.exports = router;
