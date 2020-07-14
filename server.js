var fs = require('fs');
var express = require('express');
var app = express();

// Constants
const PORT = 8080;
const HOST = '0.0.0.0';

/***
 * index route
 */
fs.readFile('index.html', function (err, html) {
    if (err) {
        throw err;
    }
    app.get('/', function (req, res) {
        res.writeHeader(200, {"Content-Type": "text/html"});
        res.write(html);
        res.end();
    });
});

/***
 * javascript route
 */
fs.readFile('js/k-pop.js', function (err, js) {
    if (err) {
        throw err;
    }
    app.get('/js/k-pop.js', function (req, res) {
        res.writeHeader(200, {"Content-Type": "text/javascript"});
        res.write(js);
        res.end();
    });
});

/***
 * css route
 */
fs.readFile('css/index.css', function (err, js) {
    if (err) {
        throw err;
    }
    app.get('/css/index.css', function (req, res) {
        res.writeHeader(200, {"Content-Type": "text/css"});
        res.write(js);
        res.end();
    });
});

app.listen(PORT, function () {
    console.log('K-pop app running on port [' + PORT + '] \nPress CTRL+C to terminate');
});