(function() {
// - -------------------------------------------------------------------- - //

  Reactor.UI.app = {

    componentDidMount: function() {

      for (var id in Reactor.prefs.view) {
        Reactor.UA.toggleView(id,Reactor.prefs.view[id]);
      }

      $(document).on("resizestop",function() {
        for (var id in Reactor.prefs.size) {
          var elm = document.getElementById(id);
          if (elm) {
            var width = elm.style.width;
            var height = elm.style.height;
            if (/[0-9]+\.[0-9]+/.test(width)) {
              Reactor.prefs.size[id] = width;
            } else {
              Reactor.prefs.size[id] = height;
            }
          }
        }
      });

      $(document).on("keyup",function(ev) {
        if (ev.ctrlKey && ev.which == 9) {
          Reactor.UI.listDatabases.selectNextItem();
        }
      });

      $(document).on("selectstart",function(ev) { ev.preventDefault() });
      $(".layout.vertical").resizer("vertical");
      $(".layout.horizontal").resizer("horizontal");
      $("section").focusable();

      Reactor.AI.pinned().done(function(rows) {
        var items = rows.map(function(row) {
          return {
            key: row.path,
            text: row.name,
            icon: "x",
            data: row,
          };
        });
        $("#app main").toggle(items.length > 0);
        Reactor.UI.listDatabases.setItems(items);
      },Atomic.error);

      Reactor.AI.exec.on("done",function(ret,args) {
        if (args[2] === true) {
          Reactor.UA.updateHistory();
        }
      });

    },

  };

// - -------------------------------------------------------------------- - //

  Reactor.UI.menuDatabase = {

    componentDidUpdate: function() {
      var database = Reactor.UI.listDatabases.getContextItem();
      if (database) {
        Reactor.UI.menuDatabase.setItem(0,{
          checked: database.data.pinned == 1,
        });
      }
    },

  };

  Reactor.UI.listDatabases = {

    componentDidMount: function() {
      $("#listDatabases").on("click","span.icon",function(ev) {
        Reactor.UA.closeDatabase();
        ev.stopPropagation();
      });
    },

  };

// - -------------------------------------------------------------------- - //

  Reactor.UI.write = {

    componentDidMount: function() {
      var editor = Reactor.UI.editor = CodeMirror($("#write")[0],CodeMirror.defaults);
      editor.setOption("theme","pastel-on-dark");
      editor.addKeyMap({
          "Ctrl-Enter": function() {
            Reactor.UA.execQuery(editor.getQuery());
          },
      });
      $(document).on("resized",function() {
        editor.refresh();
      });
      editor.on("blur",function() {
        var database = Reactor.UI.listDatabases.getSelectedItem();
        if (database) {
          Reactor.AI.setEditorContent(database.data.path,editor.getValue());
        }
      });
      editor.on("contextmenu",function() {
        setTimeout(function() {
          var has = editor.selectQuery();
          var menu = Reactor.UI.menuQuery;
          menu.toggleItem(0,has);
          menu.toggleItem(1,has);
          menu.open();
        },50);
      });
    },

  };

// - -------------------------------------------------------------------- - //

  Reactor.UI.gridResult = {

    refreshResizer: function() {
      this._gridTitles.forEach(function(title) {
        var width = title.parent().css("width");
        title.css("width",width);
      });
      this._gridElm.resizer();
    },

    componentDidMount: function() {
      this._gridTitles = [];
      this._gridElm = $("#gridResult .grid-flex").resizer("horizontal");
      $(document).on("resized mouseenter",this.refreshResizer);
    },

    componentDidUpdate: function() {
      this._gridTitles = this._gridElm.find(".grid-title").get().map(function(elm) {
        return $(elm);
      });
      this.refreshResizer();
    },

  };

// - -------------------------------------------------------------------- - //
})();
