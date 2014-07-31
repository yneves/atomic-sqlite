(function() {
// - -------------------------------------------------------------------- - //

// @defaults
CodeMirror.defaults = {
	mode						: "text/x-sql",
	indentWithTabs	: true,
	smartIndent			: true,
	lineNumbers			: true,
	matchBrackets		: true,
	autofocus				: false,
};

// - -------------------------------------------------------------------- - //

// .afterUntil(stop)
CodeMirror.prototype.afterUntil = function(stop) {
	var total = this.lineCount();
	var cursor = this.getCursor();
	var pos = cursor.ch;
	var line = cursor.line;
	var after = "";
	while (true) {
		var end = false;
		if (line == total) {
			end = true;
		} else {
			var str = this.getLine(line) + "\n";
			for (i = pos; i < str.length; i++) {
				if (str[i] == stop) {
					pos = i + 1;
					end = true;
					break;
				} else {
					after += str[i];
				}
			}
		}
		if (end) {
			break;
		} else {
			line++;
			pos = 0;
		}
	}
	return {
		content: after,
		line: line,
		ch: pos,
	};
};

// .beforeUntil(stop)
CodeMirror.prototype.beforeUntil = function(stop) {
	var cursor = this.getCursor();
	var pos = cursor.ch;
	var line = cursor.line;
	var before = "";
	while (true) {
		var end = false;
		if (line < 0) {
			end = true;
		} else {
			var str = this.getLine(line) + "\n";
			if (pos < 0) pos = str.length;
			for (i = pos - 1; i >= 0; i--) {
				if (str[i] == stop) {
					end = true;
					pos = i + 1;
					break;
				} else {
					before = str[i] + before;
				}
			}
		}
		if (end) {
			break;
		} else {
			line--;
			pos = -1;
		}
	}
	return {
		content: before,
		line: Math.max(line,0),
		ch: Math.max(pos,0),
	};
};

// - -------------------------------------------------------------------- - //

CodeMirror.prototype.getQuery = function() {
	if (this.somethingSelected()) {
		return this.getSelection().trim();
	} else {
		var after = this.afterUntil(";");
		var before = this.beforeUntil(";");
		var query = before.content + after.content;
		return query.replace(/\t|\n|\r/g," ").trim();
	}
};

CodeMirror.prototype.appendQuery = function(query) {
	this.execCommand("goDocEnd");
	var before = this.beforeUntil(";");
	if (/\S/.test(before.content)) {
		this.replaceRange(";",this.getCursor());
		this.execCommand("goDocEnd");
	}
	this.replaceRange("\n\n" + query,this.getCursor());
};

CodeMirror.prototype.selectQuery = function() {
	var after = this.afterUntil(";");
	var before = this.beforeUntil(";");
	if (/\w/.test(after.content) || /\w/.test(before.content)) {
		this.setSelection(before,after);
		return true;
	} else {
		return false;
	}
};

// - -------------------------------------------------------------------- - //
})();
