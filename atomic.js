// - -------------------------------------------------------------------- - //

var fs = require("fs");
var cwd = __dirname;
var dev = !/app$/.test(cwd);
var main = cwd + "/atomic.html";
var config = require(cwd + "/atomic.json");
var mainWindow = null;

// - -------------------------------------------------------------------- - //

function getUID() {
	var uid;
	if (fs.existsSync(cwd + "/uid")) {
		uid = fs.readFileSync(cwd + "/uid","utf8");
	} else {
		uid = "";
		for (var i = 0; i < 8 ; i++) {
			uid += Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1);
		}
		fs.writeFileSync(cwd + "/uid",uid,"utf8");
	}
	return uid;
}

function runApp() {
	var app = require("app");
	app.on("will-quit",function() {
		if (fs.existsSync(cwd + "/pid")) fs.unlinkSync(cwd + "/pid");
		if (fs.existsSync(main)) fs.unlinkSync(main);
	});
	app.on("window-all-closed",function() {
		if (process.platform != "darwin") app.quit();
	});
	app.on("ready", function() {
		fs.writeFile(cwd + "/pid",process.pid,function(error) {
			if (error) {
				showMessage(error);
			}
			runNode();
			openWindow();
		});
	});
}

function runNode() {
	if (config && config.nodeService) {
		var node;
		var bin = ["./node.exe","./node","node"];
		for (var i = 0; i < bin.length; i++) {
			if (fs.existsSync(bin[i])) {
				node = bin[i];
				break;
			}
		}
		if (node) {
			var script = cwd + "/" + config.nodeService;
			var cp = require("child_process");
			cp.spawn(node,[script],function() {
				runNode();
			});
		} else {
			showMessage("NodeJS binary not found.");
		}
	}
}

function isRunning() {
	var running = false;
	if (fs.existsSync(cwd + "/pid")) {
		var pid = fs.readFileSync(cwd + "/pid","utf8");
		try { running = process.kill(pid,0); }
		catch(e) {}
	}
	return running;
}

function showMessage(message) {
	if (typeof message == "error") {
		message = message.toString();
	}
	var app = require("app");
	var dialog = require("dialog");
	dialog.showMessageBox({
		type: "warning",
		buttons: ["OK"],
		title: app.getName(),
		message: message.replace(/{productName}/g,app.getName()),
	});
}

function openWindow() {
	var BrowserWindow = require("browser-window");
	mainWindow = new BrowserWindow({
		width: 1000,
		height: 800,
		"min-width": 800,
		"min-height": 600,
	});
	mainWindow.on("closed", function() {
		mainWindow = null;
	});
	if (config && config.files) {
		var content = joinFiles(config.files,dev ? config.devFiles : []);
		fs.writeFile(main,content,"utf8",function(error) {
			if (error) {
				showMessage(error);
			} else {
				mainWindow.loadUrl("file://" + main);
				if (dev) {
					mainWindow.openDevTools();
				}
			}
		});
	}
}

function joinFiles() {
	var html = "<!DOCTYPE html>\n";
	html += "<html><head>";
	for (var i = 0; i < arguments.length; i++) {
		var files = arguments[i];
		if (files instanceof Array) {
			files.forEach(function(file) {
				var src, vars;
				if (file instanceof Array) {
					src = file.shift();
					vars = file;
				} else {
					src = file;
					vars = [];
				}
				src = "./" + src;
				var ext = src.split(".").pop();
				if (ext == "css") {
					html += "<link href=\"" + src + "\" rel=\"stylesheet\"/>";
				} else if (ext == "js") {
					html += "<script>";
					vars.forEach(function(name) {
						html += "window." + name + " = ";
					});
					html += "require('" + src + "')";
					html += "</script>";
				} else if (ext == "jsx") {
					html += "<script src=\"" + src + "\" type=\"text/jsx\"></script>";
				}
			});
		}
	}
	html += "</head><body></body></html>";
	return html;
}

// - -------------------------------------------------------------------- - //

if (isRunning()) {
	showMessage("{productName} is already running.");
	process.exit();
} else {
	runApp();
}

// - -------------------------------------------------------------------- - //
