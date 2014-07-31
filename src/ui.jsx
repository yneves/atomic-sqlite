/** @jsx React.DOM */
Reactor.UI.load(function(){return(
  <App id="app" title={Reactor.texts.app} menu="menuApp">

    <Menu id="menuApp" template={Reactor.menus.app} />
    <Menu id="menuTable" template={Reactor.menus.table} />
    <Menu id="menuIndex" template={Reactor.menus.index} />
    <Menu id="menuView" template={Reactor.menus.view} />
    <Menu id="menuTrigger" template={Reactor.menus.trigger} />
    <Menu id="menuColumn" template={Reactor.menus.column} />
    <Menu id="menuPragma" template={Reactor.menus.pragma} />
    <Menu id="menuDatabase" template={Reactor.menus.database} />
    <Menu id="menuHistory" template={Reactor.menus.history} />
    <Menu id="menuQuery" template={Reactor.menus.query} />
    <Menu id="menuResult" template={Reactor.menus.result} />

    <Dialog id="newDatabase" type="save" title={Reactor.texts.newDatabase} onPickFile={Reactor.UA.openDatabase} />
    <Dialog id="openDatabase" type="open" title={Reactor.texts.openDatabase} onPickFile={Reactor.UA.openDatabase} />

    <header>
      <OList id="listDatabases" menu="menuDatabase" deselect={false} onSelectItem={Reactor.UA.selectDatabase}/>
    </header>
    <main>
  		<Layout o="h">
  			<Area id="side" w={Reactor.prefs.size.side} minW="200px">
  				<Layout o="v">
  					<Area id="areaTables" h={Reactor.prefs.size.areaTables} minH="25px">
  						<Section title={Reactor.texts.tables}>
  							<UList id="listTables" menu="menuTable" onSelectItem={Reactor.UA.selectTable}/>
  						</Section>
  					</Area>
  					<Area id="areaColumns" h={Reactor.prefs.size.areaColumns} minH="25px">
  						<Section title={Reactor.texts.columns}>
  							<UList id="listColumns" menu="menuColumn" onSelectItem={Reactor.UA.selectColumn}/>
  						</Section>
  					</Area>
  					<Area id="areaIndexes" h={Reactor.prefs.size.areaIndexes} minH="25px">
  						<Section title={Reactor.texts.indexes}>
  							<UList id="listIndexes" menu="menuIndex" onSelectItem={Reactor.UA.selectIndex} />
  						</Section>
  					</Area>
  					<Area id="areaViews" h={Reactor.prefs.size.areaViews} minH="25px">
  						<Section title={Reactor.texts.views}>
  							<UList id="listViews" menu="menuView" onSelectItem={Reactor.UA.selectView} />
  						</Section>
  					</Area>
  					<Area id="areaTriggers" h={Reactor.prefs.size.areaTriggers} minH="25px">
  						<Section title={Reactor.texts.triggers}>
  							<UList id="listTriggers" menu="menuTrigger" onSelectItem={Reactor.UA.selectTrigger} />
  						</Section>
  					</Area>
            <Area id="areaPragmas" h={Reactor.prefs.size.areaPragmas} minH="25px">
              <Section title={Reactor.texts.pragmas}>
                <UList id="listPragmas" menu="menuPragma" onSelectItem={Reactor.UA.selectPragma} />
              </Section>
            </Area>
  				</Layout>
  			</Area>
  			<Area id="main" w={Reactor.prefs.size.main} minW="200px">
  				<Layout o="v">
  					<Area id="query" h={Reactor.prefs.size.query} minH="25px">
  						<Layout o="h">
  							<Area id="write" w={Reactor.prefs.size.write} minW="100px" />
  							<Area id="history" w={Reactor.prefs.size.history} minW="100px">
                  <Section title={Reactor.texts.history}>
                    <UList id="listHistory" menu="menuHistory" onSelectItem={Reactor.UA.selectHistory} />
                  </Section>
                </Area>
  						</Layout>
  					</Area>
  					<Area id="result" h={Reactor.prefs.size.result} minH="25px">
              <Grid id="gridResult" menu="menuResult"/>
  					</Area>
  				</Layout>
  			</Area>
  		</Layout>
    </main>
    <footer>
      <span className="text" />
    </footer>
  </App>
)});
