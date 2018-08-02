import React from 'react';
import ReactDOM from 'react-dom';
import Widget from 'laboratory/widget';
import MouseTrap from 'mousetrap';
import importer from 'laboratory/importer/';
import {Unit} from 'electrum-theme';

import Container from 'gadgets/container/widget';
import Button from 'gadgets/button/widget';
import Combo from 'gadgets/combo/widget';
import NabuToolBar from 'nabu/toolbar/widget';
import Notifications from 'desktop/notifications/widget';

const wiredNotifications = Widget.Wired(Notifications);
const viewImporter = importer('view');

/******************************************************************************/

let currentThemeName = 'default'; // FIXME: Move to state !?

const themes = [
  {text: 'Standard', name: 'default'},
  {text: 'Standard compact', name: 'default-compact'},
  {text: 'Vert', name: 'default-green'},
  {text: 'Vert spécial', name: 'special-green'},
  {text: 'Vert arrondi', name: 'smooth-green'},
  {text: 'Rose', name: 'default-pink'},
  {text: 'Rose compact', name: 'compact-pink'},
  {text: 'Monochrome compact', name: 'compact-mono'},
  {text: 'Foncé', name: 'default-dark'},
  {text: 'Dragula', name: 'default-dragula'},
];

/******************************************************************************/

class Desktop extends Widget {
  constructor() {
    super(...arguments);

    this.comboButton = null;

    this.state = {
      showMenuTheme: false,
    };

    this.onChangeScreen = this.onChangeScreen.bind(this);
    this.onChangeMandate = this.onChangeMandate.bind(this);
    this.onChangeTheme = this.onChangeTheme.bind(this);
    this.onTab = this.onTab.bind(this);
    this.onShiftTab = this.onShiftTab.bind(this);
  }

  componentDidMount() {
    super.componentDidMount();
    //- MouseTrap.bind('tab', this.onTab);
    //- MouseTrap.bind('shift+tab', this.onShiftTab);
  }

  componentWillUnmount() {
    //- MouseTrap.unbind('tab');
    //- MouseTrap.unbind('shift+tab');
  }

  get showMenuTheme() {
    return this.state.showMenuTheme;
  }

  set showMenuTheme(value) {
    this.setState({
      showMenuTheme: value,
    });
  }

  static get wiring() {
    return {
      id: 'id',
      username: 'username',
      routesMap: 'routes',
      show: 'showNotifications',
      data: 'notifications',
    };
  }

  onChangeScreen() {
    this.do('change-screen');
  }

  onChangeMandate() {
    this.do('change-mandate');
  }

  onChangeTheme(name) {
    currentThemeName = name;
    this.do('change-theme', {name});
  }

  onTab(e) {
    console.log('desktop.onTab');
    e.preventDefault();
  }

  onShiftTab(e) {
    console.log('desktop.onShiftTab');
    e.preventDefault();
  }

  /******************************************************************************/

  renderNofications() {
    const WiredNotifications = wiredNotifications(this.props.id);

    return <WiredNotifications />;
  }

  renderMenuTheme() {
    if (this.showMenuTheme) {
      const node = ReactDOM.findDOMNode(this.comboButton);
      const rect = node.getBoundingClientRect();
      const top = Unit.add(
        rect.bottom + 'px',
        this.context.theme.shapes.flyingBalloonTriangleSize
      );

      const list = [];
      for (const theme of themes) {
        list.push({
          text: theme.text,
          active: theme.name === currentThemeName,
          action: () => this.onChangeTheme(theme.name),
        });
      }

      return (
        <Combo
          menuType="wrap"
          width="200px"
          left={(rect.left + rect.right) / 2}
          top={top}
          list={list}
          close={() => (this.showMenuTheme = false)}
        />
      );
    } else {
      return null;
    }
  }

  connectLocalStateMonitor() {
    return this.mapWidget(
      props => {
        const size = props.state.size;
        const offset = props.offset || 25;
        const overloadLimit = props.overloadLimit || 300;
        const load = (size - offset) / overloadLimit;
        return (
          <div style={{fontWeight: 900}}>
            LocalState: {(load * 100).toFixed(0)}%
          </div>
        );
      },
      'state',
      'backend'
    );
  }

  connectWarehouseInfosMonitor() {
    return this.mapWidget(
      props => {
        if (!props.infos) {
          return <div style={{fontWeight: 900}}>WarehouseInfos: N/A</div>;
        }
        const size = props.infos.size;
        const offset = props.offset || 25;
        const overloadLimit = props.overloadLimit || 300;
        const load = (size - offset) / overloadLimit;
        return (
          <div style={{fontWeight: 900}}>
            WarehouseState: {(load * 100).toFixed(0)}% Feeds:{props.infos.feeds}
          </div>
        );
      },
      'infos',
      'infos.warehouse'
    );
  }

  render() {
    const {id, routesMap} = this.props;

    if (!id) {
      return null;
    }

    const LocalStateMonitor = this.connectLocalStateMonitor();
    const WarehouseMonitor = this.connectWarehouseInfosMonitor();
    const routes = {
      '/hinter/': {},
      '/task-bar/': {},
      '/top-bar/': {},
      '/before-content/': {},
      '/content/': {},
    };

    Widget.shred(routesMap).select((k, v) => {
      const ex = /^(\/.[:\-a-z]+\/).*/;
      const res = ex.exec(v);
      let mount = '/';
      if (res) {
        mount = res[1];
      }
      if (routes[mount]) {
        routes[mount] = {path: v.replace(mount, '/'), component: k};
      } else {
        console.warn(`Invalid mount point ${mount} for ${k}`);
      }
    });

    const taskView = viewImporter(routes['/task-bar/'].component);
    const Tasks = Widget.WithRoute(taskView, 'context')(
      routes['/task-bar/'].path
    );

    const contentView = viewImporter(routes['/content/'].component);
    const Content = Widget.WithRoute(
      contentView,
      ['context', 'view'],
      ['wid', 'did']
    )(routes['/content/'].path);

    const topbarView = viewImporter(routes['/top-bar/'].component);
    const TopBar = Widget.WithRoute(topbarView, 'context')(
      routes['/top-bar/'].path
    );

    const beforeView = viewImporter(routes['/before-content/'].component);
    const BeforeContent = Widget.WithRoute(beforeView, 'context')(
      routes['/before-content/'].path
    );

    const contentClass = this.styles.classNames.content;

    return (
      <Container kind="root">
        <Container kind="left-bar">
          <Container kind="task-bar">
            <Button
              textTransform="none"
              text={this.props.id.split('@')[1]}
              glyph="light/cube"
              tooltip="Changer de mandat"
              kind="task-logo"
              onClick={this.onChangeMandate}
            />
            <Tasks desktopId={id} />
          </Container>
        </Container>
        <Container kind="right">
          <Container kind="content">
            <Container kind="top-bar">
              <TopBar desktopId={id} />
              <Container kind="main-tab-right">
                <Button
                  ref={x => (this.comboButton = x)}
                  glyph="solid/tint"
                  kind="main-tab-right"
                  active={this.showMenuTheme}
                  tooltip="Choix du thème"
                  onClick={() => (this.showMenuTheme = true)}
                />
                <Button
                  glyph="solid/tv"
                  kind="main-tab-right"
                  onClick={this.onChangeScreen}
                />
                {window.zoomable ? (
                  <Button
                    glyph="solid/plus"
                    kind="main-tab-right"
                    onClick={() => {
                      window.zoom();
                    }}
                  />
                ) : null}
                {window.zoomable ? (
                  <Button
                    glyph="solid/minus"
                    kind="main-tab-right"
                    onClick={() => {
                      window.unZoom();
                    }}
                  />
                ) : null}
                <Button text={this.props.username} kind="main-tab-right" />
              </Container>
            </Container>
            <BeforeContent desktopId={id} />
            <div className={contentClass}>
              <Content desktopId={id} />
              {this.renderNofications()}
              {this.renderMenuTheme()}
            </div>
            <Container kind="footer">
              <NabuToolBar />
              <LocalStateMonitor />
              <br />
              <WarehouseMonitor />
            </Container>
          </Container>
        </Container>
      </Container>
    );
  }
}

/******************************************************************************/
export default Desktop;
