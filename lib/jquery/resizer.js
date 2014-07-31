(function($) {
// - -------------------------------------------------------------------- - //

// .resizer()
$.fn.resizer = function(arg) {
	var args = arguments;
	return this.each(function() {

		var elm = $(this);
		var namespace = "resizer";
		var opts = elm.data(namespace);

		// already initialized
		if (opts) {
			elm.triggerHandler("resizerefresh." + namespace);

		// first call
		} else {

			opts = {};
			opts.mode = "vertical";
			opts.selector = ":visible";
			opts.distance = 5;

			if ($.isFunction(arg)) {
				elm.on("resized." + namespace,arg);
			} else if ($.type(arg) == "string") {
				opts.mode = arg.toLowerCase();
			} else if ($.isPlainObject(arg)) {
				if (arg.mode) opts.mode = arg.mode.toLowerCase();
				if (arg.selector) opts.selector = arg.selector;
				if ($.isNumeric(arg.distance)) opts.distance = arg.distance;
				if ($.isNumeric(arg.minHeight)) opts.minHeight = arg.minHeight;
				if ($.isNumeric(arg.minWidth)) opts.minWidth = arg.minWidth;
				if ($.isFunction(arg.start)) elm.on("resizestart." + namespace,arg.start);
				if ($.isFunction(arg.stop)) elm.on("resizestop." + namespace,arg.stop);
				if ($.isFunction(arg.pause)) elm.on("resizepause." + namespace,arg.pause);
				if ($.isFunction(arg.resized)) elm.on("resized." + namespace,arg.resized);
			}

			if (opts.mode == "v") opts.mode == "vertical";
			if (opts.mode == "h") opts.mode == "horizontal";

			elm.data(namespace,opts).addClass(namespace);

			var win = $(window);
			var doc = $(document);

			var horizontal = opts.mode == "horizontal";
			var prop = horizontal ? "width" : "height";
			var cursor = horizontal ? "w-resize" : "s-resize";

			var curX;
			var curY;
			var lastX;
			var lastY;
			var interval;
			var frequency = 10;
			var paused = false;
			var resizing = false;
			var resizable = -1;

// - -------------------------------------------------------------------- - //

			var total;
			var next = [];
			var prev = [];
			var mins = [];
			var items = [];
			var sizes = [];
			var offsets = [];

			function mapItems() {
				next = [];
				prev = [];
				mins = [];
				items = [];
				sizes = [];
				offsets = [];
				total = parseInt(elm.css(prop));
				elm.children(opts.selector).each(function(idx) {
					var item = $(this);
					items[idx] = item;
					mins[idx] = parseInt(item.css("min-" + prop));
					sizes[idx] = parseInt(item.css(prop));
					offsets[idx] = item.offset();
					if (resizable > -1) {
						if (idx >= resizable) {
							next.push(idx);
						} else if (idx < resizable) {
							prev.unshift(idx);
						}
					}
				});
			}

// - -------------------------------------------------------------------- - //

			function getOffset(i) {
				return items[i].offset();
			}

			function getSize(i) {
				return parseInt(items[i].css(prop));
			}

			function setSize(i,size) {
				items[i].css(prop,size);
			}

			function setCursor(on) {
				elm.css("cursor",on ? cursor : "");
			}

// - -------------------------------------------------------------------- - //

			function triggerStart() {
				elm.trigger("resizestart");
				elm.on("selectstart." + opts.namespace,function(ev) { ev.preventDefault() });
			}

			function triggerStop() {
				elm.trigger("resizestop");
				elm.off("selectstart." + opts.namespace);
			}

			function triggerPause() {
				elm.trigger("resizepause");
			}

			function triggerResized() {
				elm.trigger("resized");
			}

// - -------------------------------------------------------------------- - //

			function mouseUp(ev) {
				// if it was resizing then stops on mouse release
				if (resizing) {
					resizeStop(ev);
				}
			}

			function mouseDown(ev) {
				// if mouse is over the resizing area then starts resizing
				if (resizable > -1) {
					resizeStart(ev);
				}
			}

			function mouseMove(ev) {

				if (resizing) {

					// resize is being done every XXX ms
					curX = ev.pageX;
					curY = ev.pageY;

				} else if (resizable > -1) {

					// restore cursor if mouse left the resizing area of the element
					var pos = offsets[resizable];
					var over = horizontal
						? ev.pageX > pos.left - opts.distance && ev.pageX < pos.left + opts.distance
						: ev.pageY > pos.top - opts.distance && ev.pageY < pos.top + opts.distance;
					if (!over) {
						setCursor(false);
						resizable = -1;
					}

				} else {

					if (horizontal) {

						// change cursor if mouse is over the resizing area of an element
						for (var i = 1; i < items.length; i++) {
							var pos = offsets[i];
							var overX = ev.pageX > pos.left - opts.distance && ev.pageX < pos.left + opts.distance;
							if (overX) {
								setCursor(true);
								resizable = i;
								break;
							}
						}

					} else {

						// change cursor if mouse is over the resizing area of an element
						for (var i = 1; i < items.length; i++) {
							var pos = offsets[i];
							var overY = ev.pageY > pos.top - opts.distance && ev.pageY < pos.top + opts.distance;
							if (overY) {
								setCursor(true);
								resizable = i;
								break;
							}
						}

					}

				}

			}

			function windowResize() {
				if (!resizing) {
					resizing = true;
					doc.one("mouseenter." + namespace,function() {
						resizeRefresh();
						resizing = false;
					});
				}
			}

// - -------------------------------------------------------------------- - //

			function resizeUp(resize) {
				var used = 0;
				// shrinks all the previous elements
				for (var i = 0; i < prev.length; i++) {
					var size = getSize(prev[i]) - resize;
					var min = mins[i];
					if (size >= min) {
						used += size;
						setSize(prev[i],size);
						break;
					} else {
						used += min;
						setSize(prev[i],min);
						// pause resizing if first element reach minimum height
						paused = (i == prev.length - 1);
					}
				}
				// expands the immediate next element
				for (var i = next.length - 1; i >= 0; i--) {
					var size = getSize(next[i]);
					if (i == 0) {
						size = Math.min(size + resize,total - used);
						setSize(next[i],size);
					} else {
						used += size;
					}
				}
			}

			function resizeDown(resize) {
				var used = 0;
				// shrinks all the next elements
				for (var i = 0; i < next.length; i++) {
					var size = getSize(next[i]) - resize;
					var min = mins[i];
					if (size >= min) {
						used += size;
						setSize(next[i],size);
						break;
					} else {
						used += min;
						setSize(next[i],min);
						// pause resizing if last element reach minimum size
						paused = (i == next.length - 1);
					}
				}

				// expands the immediate previous element
				for (var i = prev.length - 1; i >= 0; i--) {
					var size = getSize(prev[i]);
					if (i == 0) {
						size = Math.min(size + resize,total - used);
						setSize(prev[i],size);
					} else {
						used += size;
					}
				}
			}

			function resizeStart(ev) {
				resizing = true;
				curX = lastX = ev.pageX;
				curY = lastY = ev.pageY;
				mapItems();
				for (var i = 0; i < items.length; i++) {
					setSize(i,sizes[i]);
				}
				interval = setInterval(horizontal ? resizeHorizontal : resizeVertical,frequency);
			}

			function resizeStop(ev) {
				clearInterval(interval);
				if (horizontal) {
					curX = ev.pageX;
					resizeHorizontal();
				} else {
					curY = ev.pageY;
					resizeVertical();
				}
				mapItems();

				// fills possible empty pixels at the end
				var used = 0;
				for (var i = 0; i < items.length; i++) {
					if (i == items.length - 1) {
						sizes[i] = total - used;
						setSize(i,sizes[i]);
					}
					used += sizes[i];
				}

				// calculates dimensions as percentages to follow window or parent resizing
				var used = 0;
				for (var i = 0; i < items.length; i++) {
					var percent = (i == items.length - 1)
						? (100 - used)
						: (sizes[i] * 100 / total);
					percent = percent.toFixed(2);
					setSize(i,percent + "%");
					used += parseFloat(percent);
				}

				// clear everything and refresh positions
				next = prev = interval = curY = lastY = curX = lastX = null;
				paused = resizing = false;
				resizable = -1;

				triggerStop();
			}

			function resizeVertical() {
				if (curY != lastY) {
					if (paused) {
						var pos = getOffset(resizable);
						var over = curY > pos.top - opts.distance && curY < pos.top + opts.distance;
						paused = !over;
					} else {
						if (curY < lastY) {
							resizeUp(lastY - curY);
						} else if (curY > lastY) {
							resizeDown(curY - lastY);
						}
						if (paused) {
							triggerPause();
						} else {
							triggerResized();
						}
					}
					lastY = curY;
				}
			}

			function resizeHorizontal() {
				if (curX != lastX) {
					if (paused) {
						var pos = getOffset(resizable);
						var over = curX > pos.top - opts.distance && curX < pos.top + opts.distance;
						paused = !over;
					} else {
						if (curX < lastX) {
							resizeUp(lastX - curX);
						} else if (curX > lastX) {
							resizeDown(curX - lastX);
						}
						if (paused) {
							triggerPause();
						} else {
							triggerResized();
						}
					}
					lastX = curX;
				}
			}

			function resizeRefresh() {

				mapItems();

				var used = 0;
				for (var i = 0; i < items.length; i++) {
					used += sizes[i];
				}

				// if using more space than available cuts from some element
				if (used > total) {
					var resize = used - total;
					for (var i = 0; i < items.length; i++) {
						if (sizes[i] > mins[i]) {
							var available = sizes[i] - mins[i];
							if (available >= resize) {
								sizes[i] -= resize;
								setSize(i,sizes[i]);
								break;
							}
						}
					}

				// if using less space than available distribute among those which aren't minimized
				} else if (used < total) {
					var resize = total - used;
					for (var i = 0; i < items.length; i++) {
						if (sizes[i] > mins[i]) {
							sizes[i] += resize;
							setSize(i,sizes[i]);
							break;
						}
					}
				}

				// calculates dimensions as percentages to follow window or parent resizing
				var used = 0;
				for (var i = 0; i < items.length; i++) {
					var percent = (i == items.length - 1) ? (100 - used) : (sizes[i] * 100 / total);
					percent = percent.toFixed(2);
					setSize(i,percent + "%");
					used += parseFloat(percent);
				}

			}

// - -------------------------------------------------------------------- - //

			doc.ready(resizeRefresh);
			win.on("resize." + namespace,windowResize);
			elm.on("mouseup." + namespace,mouseUp);
			elm.on("mousedown." + namespace,mouseDown);
			elm.on("mousemove." + namespace,mouseMove);
			elm.on("mouseleave." + namespace,mouseUp);
			elm.on("mouseenter." + namespace,resizeRefresh)
			elm.on("resizerefresh." + namespace,resizeRefresh);

		}

	});
};

// - -------------------------------------------------------------------- - //
})(window.jQuery);
