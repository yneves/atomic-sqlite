/** @jsx React.DOM */
(function() {
// - -------------------------------------------------------------------- - //

	Reactor.UI.createMethod("load",function(loader) {
		var component;
		eval( "component = " + loader.toString() + "()" );
		React.renderComponent(component,document.body);
	});

// - -------------------------------------------------------------------- - //

	var App = Reactor.createClass({
		displayName: "App",
		mixins: [Reactor.addons.App],
		render: function() {
			return (
				<div className="app">
					{this.props.children}
				</div>
			);
		},
	});

	var Menu = Reactor.createClass({
		displayName: "Menu",
		mixins: [Reactor.addons.Menu],
		render: function() {
			return (
				<menu style={{display:"none"}} />
			);
		},
	});

	var Dialog = Reactor.createClass({
		displayName: "Dialog",
		mixins: [Reactor.addons.Dialog],
		render: function() {
			return (
				<div style={{display:"none"}} />
			);
		},
	});

// - -------------------------------------------------------------------- - //

	var Area = Reactor.createClass({
		displayName: "Area",
		render: function() {
			var style = {
				float: "left",
				width: this.props.w || this.props.width || "100%",
				height: this.props.h || this.props.height || "100%",
				minWidth: this.props.minW || this.props.minWidth,
				minHeight: this.props.minH || this.props.minHeight,
				overflow: this.props.overflow || "hidden",
			};
			return (
				<div style={style} className="area">
					{this.props.children}
				</div>
			);
		},
	});

	var Layout = Reactor.createClass({
		displayName: "Layout",
		render: function() {
			var style = {
				float: "left",
				width: "100%",
				height: "100%",
				overflow: "hidden",
			};
			var orientation = {
				v: "vertical",
				h: "horizontal",
				vertical: "vertical",
				horizontal: "horizontal",
			}[this.props.o || this.props.orientation];
			return (
				<div style={style} className={"layout " + orientation}>
					{this.props.children}
				</div>
			);
		},
	});

	var Section = Reactor.createClass({
		displayName: "Section",
		render: function() {
			return (
				<section>
					<h1><span className="text">{this.props.title}</span></h1>
					<div>{this.props.children}</div>
				</section>
			);
		},
	});

	var UList = Reactor.createClass({
		displayName: "UList",
		mixins: [Reactor.addons.List],
		render: function() {
			var list = this;
			return (
				<ul>
					{this.state.items.map(function(item,idx) {
						var selectItem = function() { list.selectItem(idx) };
						var contextItem = function() { list.contextItem(idx) };
						return (
							<li key={item.key} onContextMenu={contextItem} onClick={selectItem} className={idx == list.state.selectedIndex ? "selected" : ""}>
								{item.icon ? <span className={"icon octicon octicon-" + item.icon} /> : null}
								{item.text ? <span className="text">{item.text}</span> : ""}
							</li>
						);
					})}
				</ul>
			)
		}
	});

	var OList = Reactor.createClass({
		displayName: "OList",
		mixins: [Reactor.addons.List],
		render: function() {
			var list = this;
			return (
				<ol>
					{this.state.items.map(function(item,idx) {
						var selectItem = function() { list.selectItem(idx) };
						var contextItem = function() { list.contextItem(idx) };
						return (
							<li key={item.key} onContextMenu={contextItem} onClick={selectItem} className={idx == list.state.selectedIndex ? "selected" : ""}>
								{item.icon ? <span className={"icon octicon octicon-" + item.icon} /> : null}
								{item.text ? <span className="text">{item.text}</span> : ""}
							</li>
						);
					})}
				</ol>
			)
		}
	});

	var Table = Reactor.createClass({
		displayName: "Table",
		getInitialState: function() {
			return { head: [], rows: [] };
		},
		render: function() {
			return (
				<table>
					<thead>
						<tr>
							{this.state.head.map(function(col,idx) {
								return (
										<th style={style}>
											<span className="text">{col}</span>
										</th>
								);
							})}
						</tr>
					</thead>
					<tbody>
						{this.state.rows.map(function(row) {
							return (
									<tr>
										{this.state.head.map(function (col,idx) {
											return (
												<td style={style}>
													<span className="text">{row[col]}</span>
												</td>
											);
										})}
									</tr>
							);
						}.bind(this))}
					</tbody>
				</table>
			);
		},
	});

	var Grid = Reactor.createClass({
		displayName: "Grid",
		mixins: [Reactor.addons.Grid],
		render: function() {
			var grid = [];
			this.state.cols.forEach(function(col,idx) {
				grid[idx] = [];
				grid[idx].push(
					<div key={"title-"+idx} className="grid-title">
						<span className="text">{col}</span>
					</div>
				);
			});
			this.state.rows.forEach(function(row,ridx) {
				this.state.cols.forEach(function(col,idx) {
					grid[idx].push(
						<div key={"data-"+idx+"-"+ridx} data-row={ridx} data-col={idx} className="grid-data">
							<span className="text">{row[col]}</span>
						</div>
					);
				});
			}.bind(this));
			return (
				<div className="grid" onContextMenu={this.handleContext}>
					<div className="grid-flex">
						{grid.map(function(col,idx) {
							return (
								<div key={"col-"+idx} className="grid-col">
									{col}
								</div>
							);
						})}
					</div>
				</div>
			);
		},
	});


// - -------------------------------------------------------------------- - //
})();
