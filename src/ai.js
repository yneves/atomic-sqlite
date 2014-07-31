(function() {
// - -------------------------------------------------------------------- - //

  var lib = {
    db: require("bauer-db"),
    sql: require("bauer-sql"),
  };

  var DB = {};
  var CWD = __dirname;

  Reactor.AI.load({

    use: function(arg) {
      var path, schema;
      if (typeof arg == "string") {
        path = arg;
      } else if (typeof arg == "object") {
        path = arg.database;
        schema = arg.schema;
      } else if (arguments.length == 0) {
        path = CWD + "/../db/db.sqlite";
        schema = CWD + "/../db/db-schema.json";
      }
      if (!DB[path]) {
        var db = new lib.db.cls.Remote();
        db.connect({ file: CWD + "/../db/db-port" });
        db.on("error",function(error) {
          if (error.code == "ECONNREFUSED") {
            this.connect({ file: CWD + "/../db/db-port" });
          } else {
            Atomic.error(error);
          }
        });
        db.on("connect",function() {
          this.open(path,schema);
        });
        DB[path] = db;
      }
      return DB[path];
    },

    open: function(path) {
      return Reactor.AI.use().then(function(db) {
        return db.select()
            .from("database")
            .where({ path: path })
            .get()
            .then(function(row) {
              if (row) {
                return row;
              } else {
                return db.insert()
                  .into("database")
                  .fields("path","name")
                  .values(path,path.split(/\/|\\/).pop())
                  .run()
                  .then(function(id) {
                    return db.select()
                      .from("database")
                      .where({ id: id })
                      .get();
                  });
              }
            });
      });
    },

    close: function(path) {
      if (DB[path]) {
        DB[path].disconnect();
        delete DB[path];
      }
    },

    pin: function(path) {
      return Reactor.AI.use().then(function(db) {
        return db.update()
          .table("database")
          .set({ pinned: 1 })
          .where({ path: path })
          .run()
          .then(function() {
              return db.select()
                .from("database")
                .where({ path: path })
                .get();
          });
        });
    },

    unpin: function(path) {
      return Reactor.AI.use().then(function(db) {
        return db.update()
          .table("database")
          .set({ pinned: 0 })
          .where({ path: path })
          .run()
          .then(function() {
              return db.select()
                .from("database")
                .where({ path: path })
                .get();
          });
      });
    },

    pinned: function() {
      return Reactor.AI.use().then(function(db) {
        return db.select()
          .from("database")
          .where({ pinned: 1 })
          .order("name ASC")
          .all();
      });
    },

    save: function(path,query) {
      return Reactor.AI.use().then(function(db) {
        return db.select()
          .from("database")
          .where({ path: path })
          .get()
          .then(function(row) {
            if (row) {
              return db.insert()
                .into("history")
                .fields("database","query","timestamp")
                .values(row.id,query,new Date().getTime())
                .run();
            }
          });
      });

    },

    exec: function(path,query,save) {
      return Reactor.AI.use(path).then(function(db) {
        query = query.trim();
        var method = /^SELECT |^PRAGMA /i.test(query) ? db.all : db.run;
        var param = { text: query, args: [] };
        return db.when(param).then(method).then(function(result) {
          if (save) {
            return Reactor.AI.save(path,query).then(function() {
              return result;
            });
          } else {
            return result;
          }
        });
      });
    },

    drop: function(path,drop) {
      var query = lib.sql.drop()[drop.type](drop.name).toText("'");
      return Reactor.AI.exec(path,query,true);
    },

    dropColumn: function(path,table,column) {
      return Reactor.AI.use(path).then(function(db) {
        return db.dropColumn(table,column);
      });
    },

    browse: function(path,table) {
      var query = lib.sql.select().from(table).toText();
      return Reactor.AI.exec(path,query,true);
    },

    emptyTable: function(path,table) {
      return Reactor.AI.use(path).then(function(db) {
        return db.delete().from(table).run();
      });
    },

    describe: function(path,desc) {
      var query = lib.sql.select().from("sqlite_master").where(desc).toText("'");
      return Reactor.AI.exec(path,query,false).then(function(result) {
        if (result.rows.length > 0) {
          return result.rows[0].sql;
        } else {
          throw new Error("not found");
        }
      });
    },

    schema: function(path) {
      return Reactor.AI.use(path).then(function(db) {
        return db.schema();
      });
    },

    pragmas: function(path) {
      return Reactor.AI.use(path).then(function(db) {
        return db.pragmas();
      });
    },

    history: function(path) {
      return Reactor.AI.use().then(function(db) {
        return db.select()
          .fields("history.*")
          .from("history")
          .leftJoin({ database: "database.id = history.database" })
          .where({ "database.path": path })
          .group("history.id")
          .order("history.id DESC")
          .limit("20")
          .all();
      });
    },

    getEditorContent: function(path) {
      return Reactor.AI.use().then(function(db) {
        return db.select()
          .fields("editor.content")
          .from("editor")
          .leftJoin({ database: "database.id = editor.database" })
          .where({ "database.path": path })
          .group("editor.id")
          .limit("1")
          .get()
          .then(function(row) {
            return row ? row.content : "";
          });
      });
    },

    setEditorContent: function(path,content) {
      return Reactor.AI.use().then(function(db) {
        return db.select()
          .from("database")
          .where({ path: path })
          .get()
          .then(function(row) {
            if (row) {
              return db.delete()
                .from("editor")
                .where({ "database": row.id })
                .run()
                .then(function(changes) {
                  return db.insert()
                    .into("editor")
                    .fields("database","content")
                    .values(row.id,content)
                    .run();
                });
            }
          });
      });
    },

  });

// - -------------------------------------------------------------------- - //
})();
