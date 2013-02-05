var express = require("express");
var app = express();
var wwwDir = "/";
app.use("/", express.static(__dirname + wwwDir));
app.get("/", function(req, res) { res.render(wwwDir + "/index.html");});
app.listen(8080);