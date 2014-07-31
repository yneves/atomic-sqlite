(function() {
// - -------------------------------------------------------------------- - //

  Reactor.prefs = {

    view: {
      areaTables: true,
      areaColumns: true,
      areaIndexes: true,
      areaViews: true,
      areaTriggers: true,
      areaPragmas: true,
      history: true,
    },

    size: {
      side: "25%",
      main: "75%",
      query: "50%",
      result: "50%",
      write: "70%",
      history: "30%",
      areaTables: "25%",
      areaColumns: "15%",
      areaIndexes: "15%",
      areaViews: "15%",
      areaTriggers: "15%",
      areaPragmas: "15%",
    },

  };

// - -------------------------------------------------------------------- - //

  var fs = require("fs");
  var userPrefs = __dirname + "/user-prefs.json";
  if (fs.existsSync(userPrefs)) {
    Reactor.prefs = require(userPrefs);
  }
  window.onbeforeunload = function(e) {
    fs.writeFileSync(userPrefs,JSON.stringify(Reactor.prefs,null,2));
  };

// - -------------------------------------------------------------------- - //
})();
