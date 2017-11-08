var express = require('express');
var app = express();
var host = require('./host.json');
var ax = require('axios');
app.get('/', function(req, res) {
    res.send('Launched');
});
app.get('/vespainteractive.kingsraid.local/host.json', function(req, res) {
    res.header('Content-Type', 'application/json');
    res.status(200).send(new Buffer(JSON.stringify(host)));
});

var f = function() {
    ax.get("https://discord-bot-honger.herokuapp.com/");
    console.log('pingging heroku');
};
setInterval(f, 300000); // every 5 minutes (300000)

app.listen(process.env.PORT || 3000);