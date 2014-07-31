(function() {
// - -------------------------------------------------------------------- - //

  Reactor.menus = {};

  Reactor.menus.result = [
    {
      label: Reactor.texts.copyResultData,
      click: function() { Reactor.UA.copyResultData() },
    },
    {
      label: Reactor.texts.copyResultRow,
      click: function() { Reactor.UA.copyResultRow() },
    },
  ];

  Reactor.menus.table = [
    {
      label: Reactor.texts.browseTable,
      click: function() { Reactor.UA.browseTable() },
    },
    {
      label: Reactor.texts.copyTable,
      click: function() { Reactor.UA.copyTable() },
    },
    {
      label: Reactor.texts.emptyTable,
      click: function() { Reactor.UA.emptyTable() },
    },
    {
      label: Reactor.texts.dropTable,
      click: function() { Reactor.UA.dropTable() },
    }
  ];

  Reactor.menus.index = [
    {
      label: Reactor.texts.copyIndex,
      click: function() { Reactor.UA.copyIndex() },
    },
    {
      label: Reactor.texts.dropIndex,
      click: function() { Reactor.UA.dropIndex() },
    }
  ];

  Reactor.menus.view = [
    {
      label: Reactor.texts.browseView,
      click: function() { Reactor.UA.browseView() },
    },
    {
      label: Reactor.texts.copyView,
      click: function() { Reactor.UA.copyView() },
    },
    {
      label: Reactor.texts.dropView,
      click: function() { Reactor.UA.dropView() },
    }
  ];

  Reactor.menus.trigger = [
    {
      label: Reactor.texts.copyTrigger,
      click: function() { Reactor.UA.copyTrigger() },
    },
    {
      label: Reactor.texts.dropTrigger,
      click: function() { Reactor.UA.dropTrigger() },
    },
  ];

  Reactor.menus.column = [
    {
      label: Reactor.texts.copyColumn,
      click: function() { Reactor.UA.copyColumn() },
    },
    {
      label: Reactor.texts.dropColumn,
      click: function() { Reactor.UA.dropColumn() },
    },
  ];

  Reactor.menus.pragma = [
    {
      label: Reactor.texts.copyPragma,
      click: function() { Reactor.UA.copyPragma() },
    },
  ];

  Reactor.menus.database = [
    {
      label: Reactor.texts.pinDatabase,
      click: function(item) { Reactor.UA.pinDatabase(item) },
      checked: false,
      type: "checkbox",
    },
    {
      label: Reactor.texts.closeDatabase,
      click: function() { Reactor.UA.closeDatabase() },
    },
  ];

  Reactor.menus.history = [
    {
      label: Reactor.texts.copyHistory,
      click: function() { Reactor.UA.copyHistory() },
    },
    {
      label: Reactor.texts.execHistory,
      click: function() { Reactor.UA.execHistory() },
    }
  ];

  Reactor.menus.query = [
    {
      label: Reactor.texts.copyQuery,
      click: function() { Reactor.UA.copyQuery() },
    },
    {
      label: Reactor.texts.execQuery,
      click: function() { Reactor.UA.execQuery() },
    },
  ];

  Reactor.menus.app = [
    {
      label: "&" + Reactor.texts.file,
      submenu: [
        {
          label: "&" + Reactor.texts.newDatabase,
          click: function() { Reactor.UI.newDatabase.open() },
          accelerator: "Ctrl+N",
        },
        {
          label: "&" + Reactor.texts.openDatabase,
          click: function() { Reactor.UI.openDatabase.open() },
          accelerator: "Ctrl+O",
        },
        {
          type: "separator",
        },
        {
          label: "&" + Reactor.texts.closeDatabase,
          click: function() { Reactor.UA.closeDatabase(true) },
        },
        {
          label: "&" + Reactor.texts.closeDatabaseAll,
          click: function() { Reactor.UA.closeAllDatabases() },
        },
        {
          type: "separator",
        },
        {
          label: "&" + Reactor.texts.exit,
          click: function() { Atomic.quit() },
        }
      ],
    },
    {
      label: "&" + Reactor.texts.view,
      submenu: [
        {
          label: "&" + Reactor.texts.tables,
          checked: Reactor.prefs.view.areaTables,
          type: "checkbox",
          click: function(item) { Reactor.UA.toggleView("areaTables",item.checked) },
        },
        {
          label: "&" + Reactor.texts.columns,
          checked: Reactor.prefs.view.areaColumns,
          type: "checkbox",
          click: function(item) { Reactor.UA.toggleView("areaColumns",item.checked) },
        },
        {
          label: "&" + Reactor.texts.indexes,
          checked: Reactor.prefs.view.areaIndexes,
          type: "checkbox",
          click: function(item) { Reactor.UA.toggleView("areaIndexes",item.checked) },
        },
        {
          label: "&" + Reactor.texts.views,
          checked: Reactor.prefs.view.areaViews,
          type: "checkbox",
          click: function(item) { Reactor.UA.toggleView("areaViews",item.checked) },
        },
        {
          label: "&" + Reactor.texts.triggers,
          checked: Reactor.prefs.view.areaTriggers,
          type: "checkbox",
          click: function(item) { Reactor.UA.toggleView("areaTriggers",item.checked) },
        },
        {
          label: "&" + Reactor.texts.pragmas,
          checked: Reactor.prefs.view.areaPragmas,
          type: "checkbox",
          click: function(item) { Reactor.UA.toggleView("areaPragmas",item.checked) },
        },
        {
          label: "&" + Reactor.texts.history,
          checked: Reactor.prefs.view.history,
          type: "checkbox",
          click: function(item) { Reactor.UA.toggleView("history",item.checked) },
        },
      ],
    },
    {
      label: "&" + Reactor.texts.help,
      submenu: [
        {
          label: "&" + Reactor.texts.license,
          click: function() {
            Atomic.showMessage({
              title: Reactor.texts.app,
              message: require("fs").readFileSync(__dirname + "/../../LICENSE","utf8"),
              buttons: [Reactor.texts.ok],
            });
          },
        },
        {
          label: "&" + Reactor.texts.about,
          click: function() {
            Atomic.openUrl("http://yneves.com/atomic.sqlite/");
          },
        },
      ],
    },
  ];

// - -------------------------------------------------------------------- - //
})();
