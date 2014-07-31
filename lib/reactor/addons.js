(function() {
// - -------------------------------------------------------------------- - //

  var LIFECYCLE = {
    componentWillMount: true,
    componentWillReceiveProps: true,
    componentDidMount: true,
    shouldComponentUpdate: true,
    componentWillUpdate: true,
    componentDidUpdate: true,
    componentWillUnmount: true,
  };

  Reactor.addons = {};

// - -------------------------------------------------------------------- - //

  Reactor.addons.UI = {

    mixin: function(object) {
      this._mixed = {};
      var keys = Object.keys(object);
      for (var i = 0; i < keys.length; i++) {
        var key = keys[i];
        var val = object[key];
        if (typeof val == "function") {
          if (LIFECYCLE[key]) {
            this._mixed[key] = val.bind(this);
          } else {
            this[key] = val.bind(this);
          }
        } else {
          this[key] = val;
        }
      }
    },

    componentWillMount: function() {
      var id = this.props.id;
      if (id) {
        if (Reactor.UI[id]) {
          this.mixin(Reactor.UI[id]);
        }
        Reactor.UI[id] = this;
      }
      if (this._mixed && this._mixed.componentWillMount) {
        this._mixed.componentWillMount();
      }
    },

    componentWillUnmount: function() {
      if (this._mixed && this._mixed.componentWillUnmount) {
        this._mixed.componentWillUnmount();
      }
    },

    componentDidMount: function() {
      if (this.props.id) {
        this.getDOMNode().id = this.props.id;
      }
      if (this._mixed && this._mixed.componentDidMount) {
        this._mixed.componentDidMount();
      }
    },

    componentDidUpdate: function() {
      if (this._mixed && this._mixed.componentDidUpdate) {
        this._mixed.componentDidUpdate();
      }
    },

    componentWillUpdate: function() {
      if (this._mixed && this._mixed.componentWillUpdate) {
        this._mixed.componentWillUpdate();
      }
    },

    componentWillReceiveProps: function() {
      if (this._mixed && this._mixed.componentWillReceiveProps) {
        this._mixed.componentWillReceiveProps();
      }
    },

    shouldComponentUpdate: function() {
      if (this._mixed && this._mixed.shouldComponentUpdate) {
        return this._mixed.shouldComponentUpdate();
      } else {
        return true;
      }
    },

  };

// - -------------------------------------------------------------------- - //

  Reactor.addons.App = {

    componentDidMount: function() {
      if (this.props.menu) {
        var menu = Reactor.UI[this.props.menu];
        if (menu) {
          menu.app();
        }
      }
      if (this.props.title) {
        document.title = this.props.title;
      }
    },

  };

// - -------------------------------------------------------------------- - //

  Reactor.addons.Menu = {

    componentDidMount: function() {
      this._menu = Atomic.createMenu(this.props.template);
    },

    getInitialState: function() {
      return { open: false };
    },

    app: function() {
      Atomic.appMenu(this._menu);
    },

    open: function() {
      this.setState({ open: !this.state.open },function() {
          Atomic.openMenu(this._menu);
      });
    },

    setItem: function(index,props) {
      var menu = this._menu;
      if (menu) {
        var item = menu.items[index];
        if (item) {
          var names = Object.keys(props);
          names.forEach(function(name) {
            item[name] = props[name];
          });
        }
      }
    },

    toggleItem: function(index,enabled) {
      var menu = this._menu;
      if (menu) {
        var item = menu.items[index];
        if (item) {
          item.enabled = typeof enabled == "boolean" ? enabled : !item.enabled;
          if (item.submenu) {
            item.submenu.items.forEach(function(subitem) {
              subitem.enabled = item.enabled;
            });
          }
        }
      }
    },

  };

// - -------------------------------------------------------------------- - //

  Reactor.addons.Dialog = {

		open: function() {
			if (this.props.type == "open") {
				Atomic.openFile(this.props.title,function(file) {
					if (this.props.onPickFile) {
						this.props.onPickFile(file);
					} else if (this.props.onCancel) {
						this.props.onCancel();
					}
				}.bind(this));
			} else if (this.props.type == "save") {
				Atomic.saveFile(this.props.title,function(file) {
					if (this.props.onPickFile) {
						this.props.onPickFile(file);
					} else if (this.props.onCancel) {
						this.props.onCancel();
					}
				}.bind(this));
			}
		},

  };

// - -------------------------------------------------------------------- - //

  Reactor.addons.List = {

    componentWillMount: function() {
      this._contextIndex = -1;
    },

    getInitialState: function() {
      return { items: [], selectedIndex: -1 };
    },

    empty: function(callback) {
      this.setItems([],callback);
    },

    setItems: function(items,callback) {
      this._contextIndex = -1;
      var state = { items: items };
      var selected = this.state.selectedIndex;
      if (this.props.deselect === false) {
        if (state.items.length > 0) {
          selected = state.selectedIndex = 0;
        }
      } else {
        state.selectedIndex = -1;
      }
      this.setState(state,function() {
        if (this.props.onSelectItem) {
          if (state.selectedIndex > -1) {
            this.props.onSelectItem(state.items[state.selectedIndex],state.selectedIndex);
          } else if (selected > -1) {
            this.props.onSelectItem(null,-1);
          }
        }
        if (callback) {
          callback();
        }
      });
    },

    getItems: function() {
      return this.state.items;
    },

    getIndex: function(get) {
      var index = -1;
      if (typeof get == "string") {
        for (var i = 0; i < this.state.items.length; i++) {
          if (this.state.items[i].key == get) {
            index = i;
            break;
          }
        }
      }
      return index;
    },

    getItem: function(get) {
      var item;
      if (typeof get == "string") {
        var index = this.getIndex(get);
        if (index > -1) {
          item = this.state.items[index];
        }
      } else if (typeof get == "number") {
        item = this.state.items[i];
      }
      return item;
    },

    addItem: function(item,select) {
      var state = {};
      state.items = this.state.items;
      state.items.push(item);
      var index = state.items.length - 1;
      if (select === true) {
        state.selectedIndex = index;
      } else if (this.props.deselect === false) {
        if (this.state.selectedIndex == -1) {
          state.selectedIndex = index;
        }
      }
      this.setState(state,function() {
        if (select === true && this.props.onSelectItem) {
          this.props.onSelectItem(item,index);
        }
      });
    },

    updateItem: function(update,props) {
      var index = -1;
      var state = {};
      state.items = this.state.items;
      if (typeof update == "object") {
        if (!props) props = update;
        update = update.key
      }
      if (typeof update == "string") {
        for (var i = 0; i < state.items.length; i++) {
          if (state.items[i].key == update) {
              index = i;
              break;
          }
        }
      } else if (typeof update == "number") {
        index = update;
      }
      if (index > -1) {
        var item = state.items[index];
        if (item) {
          var names = Object.keys(props);
          names.forEach(function(name) {
            item[name] = props[name];
          });
          this.setState(state);
        }
      }
    },

    removeItem: function(remove,select) {
      if (this.props.deselect === false) {
        select = true;
      }
      var index = -1;
      var state = {};
      state.items = this.state.items;
      state.selectedIndex = this.state.selectedIndex;
      if (typeof remove == "string") {
        for (var i = 0; i < state.items.length; i++) {
          if (state.items[i].key == remove) {
              index = i;
              break;
          }
        }
      } else if (typeof remove == "number") {
        index = remove;
      }
      if (index > -1) {
        state.items.splice(index,1);
        if (state.selectedIndex > index) {
          state.selectedIndex--;
        } else if (state.selectedIndex == index) {
          if (select === true) {
            if (state.items.length > 0) {
              if (index == state.items.length) {
                state.selectedIndex = index - 1;
              } else {
                state.selectedIndex = index;
              }
            } else {
              state.selectedIndex = -1;
            }
          } else {
            state.selectedIndex = -1;
          }
        }
        this.setState(state,function () {
          if (select === true && this.props.onSelectItem) {
            var idx = this.state.selectedIndex;
            var item = this.getSelectedItem();
            this.props.onSelectItem(item,idx);
          }
        });
      }
    },

    selectItem: function(index) {
      this._contextIndex = -1;
      if (this.state.selectedIndex == index) {
        if (this.props.deselect !== false) {
          this.setState({ selectedIndex: -1 },function() {
            if (this.props.onSelectItem) {
              this.props.onSelectItem(null,-1);
            }
          });
        }
      } else {
        this.setState({ selectedIndex: index },function() {
          if (this.props.onSelectItem) {
            this.props.onSelectItem(this.state.items[index],index);
          }
        });
      }
    },

    selectNextItem: function() {
      var length = this.state.items.length;
      var selected = this.state.selectedIndex;
      if (length > 0) {
        if (selected == -1 || selected == length - 1) {
          this.selectItem(0);
        } else {
          this.selectItem(selected + 1);
        }
      }
    },

    getSelectedItem: function() {
      if (this.state.selectedIndex > -1) {
        return this.state.items[this.state.selectedIndex];
      }
    },

    getSelectedIndex: function() {
      return this.state.selectedIndex;
    },

    contextItem: function(index) {
      this._contextIndex = index;
			if (this.props.menu) {
				var menu = Reactor.UI[this.props.menu];
				if (menu) {
          menu.open();
        }
			}
    },

    getContextItem: function() {
      if (this._contextIndex > -1) {
        return this.state.items[this._contextIndex];
      } else {
        return this.getSelectedItem();
      }
    },

    getContextIndex: function() {
      return this._contextIndex;
    },

  };

// - -------------------------------------------------------------------- - //

  Reactor.addons.Grid = {

    componentWillMount: function() {
      this._contextRow = -1;
      this._contextCol = -1;
    },

    componentWillUpdate: function() {
      this._contextRow = -1;
      this._contextCol = -1;
    },

    getInitialState: function() {
      return { cols: [], rows: [] };
    },

    empty: function() {
      this.setState({ cols: [], rows: [] });
    },

    handleContext: function(ev) {
      var elm = ev.target;
      while (elm && !/grid-data/.test(elm.className)) {
        elm = elm.parentNode;
      }
      if (elm) {
        this._contextRow = elm.getAttribute("data-row");
        this._contextCol = elm.getAttribute("data-col");
        if (this.props.menu) {
          var menu = Reactor.UI[this.props.menu];
          if (menu) {
            menu.open();
          }
        }
      }
    },

    getContextRow: function() {
      if (this._contextRow > -1) {
        return this.state.rows[this._contextRow];
      }
    },

    getContextCol: function() {
      if (this._contextCol > -1) {
        return this.state.cols[this._contextCol];
      }
    },

    getContextData: function() {
      var row = this.getContextRow();
      var col = this.getContextCol();
      if (row && col) {
        return row[col];
      }
    },

  };



// - -------------------------------------------------------------------- - //

})();
