(function() {
// - -------------------------------------------------------------------- - //

  Reactor.UA.load({

    toggleView: function(id,checked) {
      var elm = Reactor.UI[id];
      if (elm) {
          $(elm.getDOMNode()).toggle(checked);
          $(".resizer").resizer();
          Reactor.prefs.view[id] = checked;
      }
      $("#side .area")
        .removeClass("first")
        .filter(":visible")
        .first()
        .addClass("first");
    },

// - -------------------------------------------------------------------- - //

    updateEditor: function() {
      var database = Reactor.UI.listDatabases.getSelectedItem();
      if (database) {
        Reactor.AI.getEditorContent(database.data.path).done(function(content) {
          Reactor.UI.editor.setValue(content);
        });
      } else {
        Reactor.UI.editor.setValue("");
      }
    },

    execQuery: function() {
      var query = Reactor.UI.editor.getQuery();
      var database = Reactor.UI.listDatabases.getSelectedItem();
      Reactor.AI.exec(database.data.path,query,true).done(function(result) {
        Reactor.UA.showResult(result);
      },Atomic.error);
    },

    copyQuery: function() {
      var query = Reactor.UI.editor.getQuery();
      Atomic.copy(query);
    },

// - -------------------------------------------------------------------- - //

    openDatabase: function(file) {
      Reactor.AI.open(file).done(function(row) {
        var index = Reactor.UI.listDatabases.getIndex(row.path);
        if (index > -1) {
          var selected = Reactor.UI.listDatabases.getSelectedIndex();
          if (index != selected) {
            Reactor.UI.listDatabases.selectItem(index);
          }
        } else {
          Reactor.UI.listDatabases.addItem({
            key: row.path,
            text: row.name,
            icon: "x",
            data: row,
          },true);
        }
      },Atomic.error);
    },

    closeDatabase: function(selected) {
      var database = selected
        ? Reactor.UI.listDatabases.getSelectedItem()
        : Reactor.UI.listDatabases.getContextItem();
      if (database) {
        Reactor.AI.close(database.data.path).done(function(row) {
          Reactor.UI.listDatabases.removeItem(database.key,true);
        },Atomic.error);
      }
    },

    closeAllDatabases: function() {
      Reactor.UI.listDatabases.getItems().forEach(function(database) {
        Reactor.AI.close(database.data.path).catch(Atomic.error).done();
      });
      Reactor.UI.listDatabases.empty();
    },

    pinDatabase: function(item) {
      var database = Reactor.UI.listDatabases.getContextItem();
      if (database) {
        if (item.checked) {
          Reactor.AI.pin(database.data.path).done(function(row) {
            Reactor.UI.listDatabases.updateItem(database.key,{ data: row });
          },Atomic.error);
        } else {
          Reactor.AI.unpin(database.key).done(function(row) {
            Reactor.UI.listDatabases.updateItem(database.key,{ data: row });
          },Atomic.error);
        }
      }
    },

    selectDatabase: function(database) {
      $("#app main").toggle(!!database);
      Reactor.UA.updateEditor();
      Reactor.UA.updateSchema();
      Reactor.UA.updatePragmas();
      Reactor.UA.updateHistory();
      Reactor.UI.gridResult.empty();
      if (database) {
        $("#app footer span.text").html(database.data.path);
      } else {
        $("#app footer span.text").html("");
      }
    },

    updateSchema: function() {
      var database = Reactor.UI.listDatabases.getSelectedItem();
      if (database) {
        Reactor.AI.schema(database.data.path).done(function(schema) {
          var tables = Object.keys(schema.tables).map(function(name) {
            return { key: name, text: name, data: schema.tables[name] };
          });
          var indexes = Object.keys(schema.indexes).map(function(name) {
            return { key: name, text: name };
          });
          var views = Object.keys(schema.views).map(function(name) {
            return { key: name, text: name };
          });
          var triggers = Object.keys(schema.triggers).map(function(name) {
            return { key: name, text: name };
          });
          Reactor.UI.listColumns.empty();
          Reactor.UI.listViews.setItems(views);
          Reactor.UI.listTables.setItems(tables);
          Reactor.UI.listIndexes.setItems(indexes);
          Reactor.UI.listTriggers.setItems(triggers);
        });
      } else {
        Reactor.UI.listColumns.empty();
        Reactor.UI.listViews.empty();
        Reactor.UI.listTables.empty();
        Reactor.UI.listIndexes.empty();
        Reactor.UI.listTriggers.empty();
        Reactor.UI.listPragmas.empty();
      }
    },

// - -------------------------------------------------------------------- - //

    selectTable: function(table) {
      var columns = [];
      if (table) {
        for (var column in table.data.fields) {
          columns.push({ key: column, text: column });
        }
      }
      Reactor.UI.listColumns.setItems(columns);
    },

    browseTable: function() {
      var database = Reactor.UI.listDatabases.getSelectedItem();
      var table = Reactor.UI.listTables.getContextItem();
      if (database && table) {
        Reactor.AI.browse(database.data.path,table.key).then(function(result) {
          Reactor.UA.showResult(result);
        });
      }
    },

    emptyTable: function() {
      Atomic.showMessage({
        type: "warning",
        title: Reactor.texts.emptyConfirm,
        buttons: [Reactor.texts.emptyOK,Reactor.texts.emptyCancel],
        message: Reactor.texts.emptyTableConfirm,
      },function(clicked) {
        if (clicked == 0) {
          var database = Reactor.UI.listDatabases.getSelectedItem();
          var table = Reactor.UI.listTables.getContextItem();
          if (database && table) {
            Reactor.AI.emptyTable(database.data.path,table.key);
          }
        }
      });
    },

    dropTable: function() {
      Atomic.showMessage({
        type: "warning",
        title: Reactor.texts.dropConfirm,
        buttons: [Reactor.texts.dropOK,Reactor.texts.dropCancel],
        message: Reactor.texts.dropTableConfirm,
      },function(clicked) {
        if (clicked == 0) {
          var database = Reactor.UI.listDatabases.getSelectedItem();
          var table = Reactor.UI.listTables.getContextItem();
          if (database && table) {
            Reactor.AI
              .drop(database.data.path,{ type: "table", name: table.key })
              .done(function() { Reactor.UA.selectDatabase(database) },Atomic.error);
          }
        }
      });
    },

    copyTable: function() {
      var database = Reactor.UI.listDatabases.getSelectedItem();
      var table = Reactor.UI.listTables.getContextItem();
      if (database && table) {
        Reactor.AI
          .describe(database.data.path,{ type: "table", name: table.key })
          .done(Atomic.copy,Atomic.error);
      }
    },

// - -------------------------------------------------------------------- - //

    selectIndex: function(index) {
    },

    dropIndex: function() {
      Atomic.showMessage({
        type: "warning",
        title: Reactor.texts.dropConfirm,
        buttons: [Reactor.texts.dropOK,Reactor.texts.dropCancel],
        message: Reactor.texts.dropIndexConfirm,
      },function(clicked) {
        if (clicked == 0) {
          var database = Reactor.UI.listDatabases.getSelectedItem();
          var index = Reactor.UI.listIndexes.getContextItem();
          if (database && index) {
            Reactor.AI
              .drop(database.data.path,{ type: "index", name: index.key })
              .done(function() { Reactor.UA.selectDatabase(database) },Atomic.error);
          }
        }
      });
    },

    copyIndex: function() {
      var database = Reactor.UI.listDatabases.getSelectedItem();
      var index = Reactor.UI.listIndexes.getContextItem();
      if (database && index) {
        Reactor.AI
          .describe(database.data.path,{ type: "index", name: index.key })
          .done(Atomic.copy,Atomic.error);
      }
    },

// - -------------------------------------------------------------------- - //

    selectView: function(view) {
    },

    browseView: function() {
      var database = Reactor.UI.listDatabases.getSelectedItem();
      var view = Reactor.UI.listViews.getContextItem();
      if (database && view) {
        Reactor.AI.browse(database.data.path,view.key).then(function(result) {
          Reactor.UA.showResult(result);
        });
      }
    },

    dropView: function() {
      Atomic.showMessage({
        type: "warning",
        title: Reactor.texts.dropConfirm,
        buttons: [Reactor.texts.dropOK,Reactor.texts.dropCancel],
        message: Reactor.texts.dropIndexConfirm,
      },function(clicked) {
        if (clicked == 0) {
          var database = Reactor.UI.listDatabases.getSelectedItem();
          var view = Reactor.UI.listViews.getContextItem();
          if (database && view) {
            Reactor.AI
              .drop(database.data.path,{ type: "view", name: view.key })
              .done(function() { Reactor.UA.selectDatabase(database) },Atomic.error);
          }
        }
      });
    },

    copyView: function() {
      var database = Reactor.UI.listDatabases.getSelectedItem();
      var view = Reactor.UI.listViews.getContextItem();
      if (database && view) {
        Reactor.AI
          .describe(database.data.path,{ type: "view", name: view.key })
          .done(Atomic.copy,Atomic.error);
      }
    },

// - -------------------------------------------------------------------- - //

    selectTrigger: function(trigger) {
    },

    dropTrigger: function() {
      Atomic.showMessage({
        type: "warning",
        title: Reactor.texts.dropConfirm,
        buttons: [Reactor.texts.dropOK,Reactor.texts.dropCancel],
        message: Reactor.texts.dropTriggerConfirm,
      },function(clicked) {
        if (clicked == 0) {
          var database = Reactor.UI.listDatabases.getSelectedItem();
          var trigger = Reactor.UI.listTriggers.getContextItem();
          if (database && trigger) {
            Reactor.AI
              .drop(database.data.path,{ type: "trigger", name: trigger.key })
              .done(function() { Reactor.UA.selectDatabase(database) },Atomic.error);
          }
        }
      });
    },

    copyTrigger: function() {
      var database = Reactor.UI.listDatabases.getSelectedItem();
      var trigger = Reactor.UI.listTriggers.getContextItem();
      if (database && trigger) {
        Reactor.AI
          .describe(database.data.path,{ type: "trigger", name: trigger.key })
          .done(Atomic.copy,Atomic.error);
      }
    },

// - -------------------------------------------------------------------- - //

    selectColumn: function(column) {
    },

    dropColumn: function() {
      Atomic.showMessage({
        type: "warning",
        title: Reactor.texts.dropConfirm,
        buttons: [Reactor.texts.dropOK,Reactor.texts.dropCancel],
        message: Reactor.texts.dropColumnConfirm,
      },function(clicked) {
        if (clicked == 0) {
          var database = Reactor.UI.listDatabases.getSelectedItem();
          var table = Reactor.UI.listTables.getSelectedItem();
          var column = Reactor.UI.listColumns.getContextItem();
          if (database && table && column) {
            Reactor.AI
              .dropColumn(database.data.path,table.key,column.key)
              .done(function() { Reactor.UA.selectDatabase(database) },Atomic.error);
          }
        }
      });
    },

    copyColumn: function() {
      var column = Reactor.UI.listColumns.getContextItem();
      if (column) {
        Atomic.copy(column.text);
      }
    },

// - -------------------------------------------------------------------- - //

    updatePragmas: function() {
      var database = Reactor.UI.listDatabases.getSelectedItem();
      if (database) {
        Reactor.AI.pragmas(database.data.path).done(function(pragmas) {
          var items = Object.keys(pragmas).map(function(name) {
            var value = pragmas[name];
            var text = name;
            if (typeof value == "object" && value !== null) {
              text += " (";
              Object.keys(value).forEach(function(key,idx) {
                if (idx > 0) text += ", ";
                text += key + "=" + value[key];
              });
              text += ")";
            } else {
              text += " = " + value;
            }
            return {
              key: name,
              text: text,
            };
          });
          Reactor.UI.listPragmas.setItems(items);
        });
      } else {
        Reactor.UI.listPragmas.empty();
      }
    },

    selectPragma: function(pragma) {
    },

    copyPragma: function() {
      var pragma = Reactor.UI.listPragmas.getContextItem();
      if (pragma) {
        Atomic.copy(pragma.key);
      }
    },

// - -------------------------------------------------------------------- - //

    updateHistory: function() {
      var database = Reactor.UI.listDatabases.getSelectedItem();
      if (database) {
        Reactor.AI.history(database.data.path).done(function(rows) {
          var items = rows.map(function(row) {
            return { key: row.id, text: row.query };
          });
          Reactor.UI.listHistory.setItems(items.reverse(),function() {
            var elm = $("#listHistory")[0];
            elm.scrollTop = elm.scrollHeight;
          });
        },Atomic.error);
      } else {
        Reactor.UI.listHistory.empty();
      }
    },

    execHistory: function() {
      var database = Reactor.UI.listDatabases.getSelectedItem();
      var history = Reactor.UI.listHistory.getContextItem();
      if (database && history) {
        Reactor.AI.exec(database.data.path,history.text,true).done(function(result) {
          Reactor.UA.showResult(result);
        },Atomic.error);
      }
    },

    copyHistory: function() {
      var history = Reactor.UI.listHistory.getContextItem();
      if (history) {
        Atomic.copy(history.text);
      }
    },

// - -------------------------------------------------------------------- - //

    showResult: function(result) {
      Reactor.UI.gridResult.setState({
        cols: result.rows.length > 0 ? Object.keys(result.rows[0]) : [],
        rows: result.rows,
      });
    },

    copyResultData: function() {
      var data = Reactor.UI.gridResult.getContextData();
      if (data) {
        Atomic.copy(data);
      }
    },

    copyResultRow: function() {
      var row = Reactor.UI.gridResult.getContextRow();
      if (row) {
        Atomic.copy(JSON.stringify(row));
      }
    },

  });

// - -------------------------------------------------------------------- - //
})();
