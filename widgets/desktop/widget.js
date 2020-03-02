//T:2019-02-27
import React from 'react';
import Widget from 'goblin-laboratory/widgets/widget';
import T from 't';
import MouseTrap from 'mousetrap';
import importer from 'goblin_importer';
import Container from 'goblin-gadgets/widgets/container/widget';
import Button from 'goblin-gadgets/widgets/button/widget';
import Separator from 'goblin-gadgets/widgets/separator/widget';
import NabuToolbar from 'goblin-nabu/widgets/nabu-toolbar/widget';
import DesktopMonitors from 'goblin-desktop/widgets/desktop-monitors/widget';
import Monitor from 'goblin-desktop/widgets/monitor/widget';
import WidgetDocCaller from 'goblin-desktop/widgets/widget-doc-caller/widget';
import Notifications from 'goblin-desktop/widgets/notifications/widget';
import MainTabMenu from 'goblin-desktop/widgets/main-tab-menu/widget';
import IMG_GOBLIN from './goblin.png';
const viewImporter = importer('view');
import {getToolbarId} from 'goblin-nabu/lib/helpers.js';
const NabuToolbarConnected = Widget.Wired(NabuToolbar)();

/******************************************************************************/

let currentTheme = 'default';
const themes = [
  {text: T('Standard'), value: 'default'},
  {text: T('Standard compact'), value: 'default-compact'},
  {text: T('Vert'), value: 'default-green'},
  {text: T('Vert spécial'), value: 'special-green'},
  {text: T('Vert arrondi'), value: 'smooth-green'},
  {text: T('Rose'), value: 'default-pink'},
  {text: T('Rose compact'), value: 'compact-pink'},
  {text: T('Monochrome compact'), value: 'compact-mono'},
  {text: T('Rétro'), value: 'default-retro'},
  {text: T('Steampunk'), value: 'steampunk-retro'},
  {text: T('Foncé'), value: 'default-dark'},
  {text: T('Dragula'), value: 'default-dragula'},
];

/******************************************************************************/

const LocaleMenuConnected = Widget.connect((state, props) => {
  const locales = state.get(`backend.nabu.locales`);
  const localeId = Widget.getUserSession(state).get('locale');

  return {
    items: locales,
    itemsTextKey: 'text',
    itemsValueKey: 'name',
    currentItemValue: localeId,
  };
})(MainTabMenu);

const TeamSelector = Widget.connect((state, props) => {
  const teamIds = state.get('backend.mandate@main.teamIds');
  if (!teamIds) {
    return {
      items: [{text: 'non configuré', value: null}],
      currentItemValue: null,
    };
  }
  const currentTeam = state.get(
    `backend.${props.desktopId}.teamId`,
    teamIds.get(0)
  );
  const items = teamIds.reduce((items, id) => {
    const item = state.get(`backend.${id}`);
    if (item) {
      items.push({text: item.get('name'), value: id});
    }
    return items;
  }, []);
  return {
    items,
    currentItemValue: currentTeam,
  };
})(MainTabMenu);

const UserInfo = Widget.connect((state, props) => {
  const teamIds = state.get('backend.mandate@main.teamIds');
  if (!teamIds) {
    return {
      text: `${props.user}`,
      kind: 'main-tab-right',
    };
  }
  const currentTeam = state.get(
    `backend.${props.desktopId}.teamId`,
    teamIds.get(0)
  );
  const team = state.get(`backend.${currentTeam}.alias`, '');
  return {
    text: `${props.user} ${team}`,
    kind: 'main-tab-right',
  };
})(Button);

/******************************************************************************/

export default class Desktop extends Widget {
  constructor() {
    super(...arguments);

    this.state = {
      showFooter: true,
    };

    this.onChangeScreen = this.onChangeScreen.bind(this);
    this.onChangeMandate = this.onChangeMandate.bind(this);
    this.onChangeLocale = this.onChangeLocale.bind(this);
    this.onChangeTheme = this.onChangeTheme.bind(this);
    this.onChangeTeam = this.onChangeTeam.bind(this);
    this.renderFooter = this.renderFooter.bind(this);
    this.onTab = this.onTab.bind(this);
    this.onShiftTab = this.onShiftTab.bind(this);
    this.togglePrompt = this.togglePrompt.bind(this);
  }

  componentDidMount() {
    super.componentDidMount();
    //- MouseTrap.bind('tab', this.onTab);
    //- MouseTrap.bind('shift+tab', this.onShiftTab);
  }

  componentWillUnmount() {
    super.componentWillUnmount();
    //- MouseTrap.unbind('tab');
    //- MouseTrap.unbind('shift+tab');
    clearInterval(this.timer);
  }

  //#region get/set
  get showFooter() {
    return this.state.showFooter;
  }

  set showFooter(value) {
    this.setState({
      showFooter: value,
    });
  }
  //#endregion

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

  onChangeLocale(locale) {
    this.do('change-locale', {locale});
  }

  onChangeTheme(name) {
    currentTheme = name;
    this.do('change-theme', {name});
  }

  onChangeTeam(teamId) {
    this.do('change-team', {teamId});
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

  togglePrompt(e) {
    if (e) {
      if (e.key === 'Enter') {
        this.dispatch({type: 'TOGGLEPROMPT'});
      }
    } else {
      this.dispatch({type: 'TOGGLEPROMPT'});
    }
  }

  connectCommandsPrompt() {
    MouseTrap.bind('ctrl+p', this.togglePrompt);
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
                onKeyPress={this.togglePrompt}
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

  /******************************************************************************/

  renderNofications() {
    return <Notifications id={this.props.id} />;
  }

  renderFooter() {
    const CommandsPrompt = this.connectCommandsPrompt();
    const footerClass = this.showFooter
      ? this.styles.classNames.footer
      : this.styles.classNames.footerHidden;

    return (
      <div className={footerClass}>
        <NabuToolbarConnected
          id={getToolbarId(this.props.id)}
          desktopId={this.props.id}
        />
        <Monitor id={this.props.id + '$monitor'} />
        <WidgetDocCaller
          desktopId={this.props.id}
          id={this.props.id + '$widget-doc-caller'}
        />
        <CommandsPrompt />
        <DesktopMonitors id="activity-monitor" desktopId={this.props.id} />
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
              tooltip={T('Changer de mandat')}
              kind="task-logo"
              onClick={this.onChangeMandate}
            />
            <Tasks desktopId={id} />
            <Separator kind="sajex" />
            <Button
              kind="task-show-footer"
              glyph="solid/chevron-right"
              tooltip={T('Montre ou cache la barre de pied de page')}
              onClick={() => (this.showFooter = !this.showFooter)}
            />
          </Container>
        </Container>
        <Container kind="right">
          <Container kind="content">
            <Container kind="top-bar">
              <TopBar desktopId={id} />
              <Container kind="main-tab-right">
                <UserInfo user={this.props.username} desktopId={id} />
                <TeamSelector
                  desktopId={id}
                  glyph="solid/users"
                  kind="main-tab-right"
                  tooltip="Team"
                  onChange={this.onChangeTeam}
                />
                <LocaleMenuConnected
                  glyph="solid/flag"
                  kind="main-tab-right"
                  tooltip={T('Choix de la locale')}
                  onChange={this.onChangeLocale}
                  desktopId={id}
                />
                <MainTabMenu
                  glyph="solid/tint"
                  kind="main-tab-right"
                  tooltip={T('Choix du thème')}
                  items={themes}
                  currentItemValue={currentTheme}
                  onChange={this.onChangeTheme}
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
                    tooltip={T('Augmente le zoom')}
                    onClick={() => {
                      this.doFor(this.context.labId, 'zoom');
                    }}
                  />
                ) : null}
                {window.zoomable ? (
                  <Button
                    text="1"
                    kind="main-tab-right"
                    tooltip={T('Remet le zoom 100%')}
                    onClick={() => {
                      this.doFor(this.context.labId, 'default-zoom');
                    }}
                  />
                ) : null}
                {window.zoomable ? (
                  <Button
                    glyph="solid/minus"
                    kind="main-tab-right"
                    tooltip={T('Diminue le zoom')}
                    onClick={() => {
                      this.doFor(this.context.labId, 'un-zoom');
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
