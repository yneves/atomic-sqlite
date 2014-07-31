(function() {
// - -------------------------------------------------------------------- - //

  var lib = {
    remote: require("remote"),
    clipboard: require("clipboard"),
  };

  var Atomic = {

    quit: function() {
      lib.remote.require("app").quit();
    },

    copy: function(text) {
      lib.clipboard.writeText(text);
    },

    error: function(error) {
      Atomic.openDev();
      console.log(error.toString(),error.stack.toString());
    },

// - -------------------------------------------------------------------- - //

    window: function() {
      return lib.remote.getCurrentWindow();
    },

    reload: function() {
      var win = Atomic.window();
      win.loadUrl(win.getUrl());
    },

    openDev: function() {
      Atomic.window().openDevTools();
    },

// - -------------------------------------------------------------------- - //

    openUrl: function(url) {
      require("shell").openExternal(url);
    },

    openFile: function(title,callback) {
      lib.remote.require("dialog").showOpenDialog({
        title: title,
        properties: ["openFile"],
      },function(files) {
        if (files && files.length > 0) {
          callback(files[0]);
        } else {
          callback();
        }
      });
    },

    saveFile: function(title,callback) {
      lib.remote.require("dialog").showSaveDialog({
        title: title,
        properties: ["saveFile"],
      },callback);
    },

    showMessage: function(options,callback) {
      lib.remote.require("dialog").showMessageBox(options,callback);
    },

// - -------------------------------------------------------------------- - //

    appMenu: function(menu) {
      lib.remote.require("menu").setApplicationMenu(menu);
    },

    openMenu: function(menu) {
      menu.popup(Atomic.window());
    },

    createMenu: function(template) {
      var menu = lib.remote.require("menu");
      if (typeof template == "string") {
        template = require(template);
      }
      return menu.buildFromTemplate(template);
    },

  };

// - -------------------------------------------------------------------- - //

  if (window) window.Atomic = Atomic;

// - -------------------------------------------------------------------- - //
})();
