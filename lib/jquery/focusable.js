(function($) {

// - -------------------------------------------------------------------- - //

// .focusable()
$.fn.focusable = function(arg) {
	var args = arguments;
	return this.each(function() {

		var elm = $(this);
		var namespace = "focusable";
		var opts = elm.data(namespace);

		// already initialized
		if (opts) {


		// first call
		} else {

			opts = {};
			opts.selector = "li";

			if ($.isPlainObject(arg)) {
				if ($.type(arg.selector) == "string") opts.selector = arg.selector;
			}

			elm.data(namespace,opts).addClass(namespace);

			if (!elm.attr("tabindex")) elm.attr("tabindex",0);

			var moved = false;
			var focused = false;
			var tabindex = null;
			var children = null;

			function start() {
				if (!focused) {
					focused = true;
					children = elm.find(opts.selector);
					elm.addClass("focused");
				}
			}

			function stop() {
				elm.removeClass("focused");
				children.removeAttr("tabindex");
				focused = false;
				tabindex = null;
			}

			function move(to) {
				if (!$.isNumeric(to) && to.jquery || to.nodeName) {
					tabindex = 0;
					to = $(to).index();
				}
				if (tabindex === null) {
					tabindex = -1;
					to = 1;
				}
				var movindex = tabindex + to;
				if (movindex == children.length) {
					movindex--;
				} else if (movindex < 0) {
					movindex = 0;
				}
				var cur = children.eq(tabindex);
				var mov = children.eq(movindex);
				if (mov.length > 0) {
					moved = true;
					cur.removeAttr("tabindex").blur();
					mov.attr("tabindex",0).focus();
					setTimeout(function() { moved = false },50);
					tabindex += to;
					if (tabindex == children.length) {
						tabindex--;
					} else if (tabindex < 0) {
						tabindex = 0;
					}
				}
			}

			function click() {
				if (tabindex !== null) {
					children.eq(tabindex).click();
				}
			}

			function context() {
				if (tabindex !== null) {
					children.eq(tabindex).trigger("contextmenu");
				}
			}

			function blur(ev) {
				if (!moved) {
					stop();
				}
			}

			function focus(ev) {
				if (ev.target === this) {
					start();
				}
			}

			function keydown(ev) {
				if (focused) {
					if (ev.which == 38 || ev.which == 37) {
						move(-1);
					} else if (ev.which == 40 || ev.which == 39) {
						move(1);
					} else if (ev.which == 13 || ev.which == 32) {
						click();
					} else if (ev.which == 93) {
						context();
					} else if (ev.shiftKey && ev.which == 9) {
						stop();
						elm.removeAttr("tabindex");
						setTimeout(function() { elm.attr("tabindex",0) },10);
					}
				}
			}

			elm.on("blur." + namespace,blur);
			elm.on("focus." + namespace,focus);
			elm.on("keydown." + namespace,keydown);

			elm.on("blur." + namespace,opts.selector,blur);
			elm.on("click." + namespace,opts.selector,function() {
				start();
				move(this);
			});
			elm.on("contextmenu." + namespace,opts.selector,function() {
				start();
				move(this);
			});

		}

	});
};

// - -------------------------------------------------------------------- - //
})(window.jQuery);
