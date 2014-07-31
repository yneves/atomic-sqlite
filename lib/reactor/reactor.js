(function() {
// - -------------------------------------------------------------------- - //

  var createEE = function(ns) {
    ns.ee = new EventEmitter();
    ns.on = function() {
      return ns.ee.on.apply(ns.ee,arguments);
    };
    ns.off = function() {
      return ns.ee.off.apply(ns.ee,arguments);
    };
    ns.emit = function() {
      return ns.ee.emit.apply(ns.ee,arguments);
    };
  };

  var createMethod = function(name,code,promise) {
    var ns = this;
    var len = arguments.length;
    var name, code, promise;
    for (var i = 0; i < len; i++) {
      var arg = arguments[i];
      var type = typeof arg;
      if (type == "function") {
        code = arg;
      } else if (type == "string") {
        name = arg;
      } else if (type == "boolean") {
        promise = arg;
      }
    }
    var method = ns[name] = function() {
      var len = arguments.length;
      var args = new Array(len);
      for (var i = 0; i < len; i++) {
        args[i] = arguments[i];
      }
      ns.emit("call",name,args);
      method.emit("call",args);
      var value, error;
      if (code) {
        try { value = code.apply(ns,args) }
        catch(e) { error = e }
      }
      if (promise) {
        var ret = new Promise(function(resolve,reject) {
          error ? reject(error) : resolve(value);
        });
        return ret.then(function(val) {
          ns.emit("done",name,val,args);
          method.emit("done",val,args);
          return val;
        }).catch(function(err) {
          ns.emit("fail",name,err,args);
          method.emit("fail",err,args);
        });
      } else {
        if (error) {
          ns.emit("fail",name,error,args);
          method.emit("fail",error,args);
          throw error;
          return;
        } else {
          ns.emit("done",name,value,args);
          method.emit("done",value,args);
          return value;
        }
      }
    };
    createEE(method);
    return;
  };

  var createNS = function() {
    var ns = {};
    createEE(ns);
    ns.extend = function(object) {
      var keys = Object.keys(object);
      keys.forEach(function(key) {
        ns[key] = object[key];
      });
    };
    ns.createNS = function(name,object) {
      ns[name] = createNS();
      if (object) {
        ns[name].extend(object);
      }
      return ns[name];
    };
    ns.createMethod = createMethod.bind(ns);
    return ns;
  };

// - -------------------------------------------------------------------- - //

  var Reactor = createNS();

  if (window) window.Reactor = Reactor;

  Reactor.createNS("UA");
  Reactor.createNS("UI");
  Reactor.createNS("AI");

  Reactor.createMethod("createClass",function(spec) {
    if (!spec.mixins) spec.mixins = [];
    spec.mixins.unshift(Reactor.addons.UI);
    return React.createClass(spec);
  });

  Reactor.UA.createMethod("load",function(methods) {
    var UA = this;
    var names = Object.keys(methods);
    names.forEach(function(name) {
      UA.createMethod(name,methods[name]);
    });
  });

  Reactor.AI.createMethod("load",function(methods) {
    var AI = this;
    var names = Object.keys(methods);
    names.forEach(function(name) {
      AI.createMethod(name,methods[name],true);
    });
  });

// - -------------------------------------------------------------------- - //
})();
