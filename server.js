const express = require('express');
const app     = express();
const path    = require("path");

try {
    // set static directories
    app.use(express.static(__dirname));
    const port = process.env.PORT || 8000;
    app.get('/', function (req, res) {
        res.sendFile(path.join(__dirname+ '/index.html'));
    });
    app.listen(port);
    console.log('Listening on port ',  port);
} catch (err){
    console.log("Could not start server: " + err.message);
}

