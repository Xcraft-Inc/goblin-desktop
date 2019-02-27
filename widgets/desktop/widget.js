import React from 'react';
import Widget from 'laboratory/widget';
import MouseTrap from 'mousetrap';
import importer from 'laboratory/importer/';
import Container from 'gadgets/container/widget';
import Button from 'gadgets/button/widget';
import Separator from 'gadgets/separator/widget';
import NabuToolbar from 'nabu/nabu-toolbar/widget';
import Monitor from 'desktop/monitor/widget';
import Notifications from 'desktop/notifications/widget';
import MainTabMenu from 'desktop/main-tab-menu/widget';
import IMG_GOBLIN from './goblin.png';
const wiredNotifications = Widget.Wired(Notifications);
const viewImporter = importer('view');
import {getToolbarId} from 'goblin-nabu/lib/helpers.js';

/******************************************************************************/

let currentTheme = 'default';

const themes = [
  {text: 'Standard', value: 'default'},
  {text: 'Standard compact', value: 'default-compact'},
  {text: 'Vert', value: 'default-green'},
  {text: 'Vert spécial', value: 'special-green'},
  {text: 'Vert arrondi', value: 'smooth-green'},
  {text: 'Rose', value: 'default-pink'},
  {text: 'Rose compact', value: 'compact-pink'},
  {text: 'Monochrome compact', value: 'compact-mono'},
  {text: 'Foncé', value: 'default-dark'},
  {text: 'Dragula', value: 'default-dragula'},
];

const LocaleMenuConnected = Widget.connect((state, props) => {
  const locales = state.get(`backend.nabu.locales`);
  const toolbarId = getToolbarId(props.desktopId);
  const toolbar = toolbarId ? state.get(`backend.${toolbarId}`) : null;

  return {
    items: locales,
    itemsTextKey: 'name',
    itemsValueKey: 'id',
    currentItemValue: toolbar ? toolbar.get('selectedLocaleId') : null,
  };
})(MainTabMenu);

/******************************************************************************/

class Desktop extends Widget {
  constructor() {
    super(...arguments);

    this.state = {
      showFooter: true,
    };
    this.onChangeScreen = this.onChangeScreen.bind(this);
    this.onChangeMandate = this.onChangeMandate.bind(this);
    this.onChangeLocale = this.onChangeLocale.bind(this);
    this.onChangeTheme = this.onChangeTheme.bind(this);
    this.renderFooter = this.renderFooter.bind(this);
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

  get showFooter() {
    return this.state.showFooter;
  }

  set showFooter(value) {
    this.setState({
      showFooter: value,
    });
  }

  static get wiring() {
    return {
      id: 'id',
      username: 'username',
      routesMap: 'routes',
    };
  }

  onChangeScreen() {
    this.do('change-screen');
  }

  onChangeMandate() {
    this.do('change-mandate');
  }

  onChangeLocale(value) {
    const toolbarId = getToolbarId(this.props.id);
    if (toolbarId) {
      this.doFor(toolbarId, 'set-selected-locale', {
        localeId: value,
      });
    }
  }

  onChangeTheme(name) {
    currentTheme = name;
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

  connectCommandsPrompt() {
    MouseTrap.bind('ctrl+p', () => this.dispatch({type: 'TOGGLEPROMPT'}));
    return this.mapWidget(
      props => {
        return (
          <div
            style={{
              position: 'fixed',
              top: '50%',
              left: '50%',
              visibility: props.show ? 'visible' : 'hidden',
              backgroundColor: 'black',
            }}
          >
            <img src={IMG_GOBLIN} />
            {props.show ? (
              <input
                style={{
                  color: 'white',
                  fontWeight: 900,
                  fontSize: '1em',
                  background: 'transparent',
                  border: 'none',
                }}
                type="text"
                list="commands"
                autoFocus={true}
                onKeyPress={e => {
                  if (e.key === 'Enter') {
                    this.dispatch({type: 'TOGGLEPROMPT'});
                  }
                }}
              />
            ) : null}
            <datalist id="commands" style={{zIndex: 100}}>
              {Object.keys(this.registry).map((cmd, index) => (
                <option key={index} value={cmd}>
                  {cmd}
                </option>
              ))}
            </datalist>
          </div>
        );
      },
      'show',
      `widgets.${this.props.id}.showPrompt`
    );
  }

  renderFooter() {
    const CommandsPrompt = this.connectCommandsPrompt();
    const Toolbar = NabuToolbar.connectTo(this);
    const footerClass = this.showFooter
      ? this.styles.classNames.footer
      : this.styles.classNames.footerHidden;

    return (
      <div className={footerClass}>
        <Toolbar desktopId={this.props.id} />
        <Monitor id={this.props.id + '$monitor'} />
        <CommandsPrompt />
      </div>
    );
  }

  render() {
    const {id, routesMap} = this.props;

    if (!id || !routesMap) {
      return null;
    }

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

    const contentClass = this.showFooter
      ? this.styles.classNames.content
      : this.styles.classNames.contentWithoutfooter;

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
            <Separator kind="sajex" />
            <Button
              kind="task-show-footer"
              glyph="solid/chevron-right"
              tooltip="Montre ou cache la barre de pied de page"
              onClick={() => (this.showFooter = !this.showFooter)}
            />
          </Container>
        </Container>
        <Container kind="right">
          <Container kind="content">
            <Container kind="top-bar">
              <TopBar desktopId={id} />
              <Container kind="main-tab-right">
                <Button text={this.props.username} kind="main-tab-right" />
                <LocaleMenuConnected
                  glyph="solid/flag"
                  kind="main-tab-right"
                  tooltip="Choix de la locale"
                  onChange={this.onChangeLocale}
                  desktopId={id}
                />
                <MainTabMenu
                  glyph="solid/tint"
                  kind="main-tab-right"
                  tooltip="Choix du thème"
                  items={themes}
                  onChange={this.onChangeTheme}
                  currentItemValue={currentTheme}
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
              </Container>
            </Container>
            <BeforeContent desktopId={id} />
            <div className={contentClass}>
              <Content desktopId={id} />
              {this.renderNofications()}
            </div>
            {this.renderFooter()}
          </Container>
        </Container>
      </Container>
    );
  }
}

/******************************************************************************/
export default Desktop;
