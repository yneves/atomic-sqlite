// - -------------------------------------------------------------------- - //

var fs = require("fs");
var db = require("bauer-db");
var cwd = __dirname;

var log = fs.createWriteStream(cwd + "/db-error.txt",{ flags: "a+" });

var server = new db.cls.Server();

server.listen();

server.on("listening",function() {
	var port = this.address().port.toString();
	fs.writeFileSync(cwd + "/db-port",port);
});

server.on("error",function(error) {
	log.write(this.now() + " | " + database + " | " + error.toString() + "\n");
});

process.on("exit",function() {
	log.end();
});

// - -------------------------------------------------------------------- - //
