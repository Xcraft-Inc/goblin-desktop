//T:2019-02-27
import React from 'react';
import Widget from 'goblin-laboratory/widgets/widget';
import MouseTrap from 'mousetrap';
import importer from 'goblin_importer';
import Container from 'goblin-gadgets/widgets/container/widget';
import NabuToolbar from 'goblin-nabu/widgets/nabu-toolbar/widget';
import DesktopTaskbar from 'goblin-desktop/widgets/desktop-taskbar/widget';
import DesktopTopbar from 'goblin-desktop/widgets/desktop-topbar/widget';
import DesktopNotifications from 'goblin-desktop/widgets/desktop-notifications/widget';
import DesktopMonitors from 'goblin-desktop/widgets/desktop-monitors/widget';
import Monitor from 'goblin-desktop/widgets/monitor/widget';
import WidgetDocCaller from 'goblin-desktop/widgets/widget-doc-caller/widget';
import IMG_GOBLIN from './goblin.png';
const viewImporter = importer('view');
import {getToolbarId} from 'goblin-nabu/lib/helpers.js';
import RetroPanel from 'goblin-gadgets/widgets/retro-panel/widget';
const NabuToolbarConnected = Widget.Wired(NabuToolbar)();
import {ColorManipulator} from 'electrum-theme';

/******************************************************************************/

export default class Desktop extends Widget {
  constructor() {
    super(...arguments);

    this.state = {
      showFooter: true,
    };

    this.togglePrompt = this.togglePrompt.bind(this);
    this.toggleFooter = this.toggleFooter.bind(this);
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
      routesMap: 'routes',
    };
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

  toggleFooter() {
    this.showFooter = !this.showFooter;
  }

  /******************************************************************************/

  renderTaskBar(routes) {
    return (
      <DesktopTaskbar
        id={this.props.id}
        routes={routes}
        onToggleFooter={this.toggleFooter}
      />
    );
  }

  renderTopBar(routes) {
    return <DesktopTopbar id={this.props.id} routes={routes} />;
  }

  renderNofications() {
    return <DesktopNotifications id={this.props.id} />;
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

  renderRetroPanel() {
    if (this.context.theme.look.name !== 'retro') {
      return null;
    }

    const c1 = ColorManipulator.darken(this.context.theme.palette.base, 0.1);
    const c2 = ColorManipulator.darken(this.context.theme.palette.base, 0.4);

    return (
      <RetroPanel
        kind="metal-plate"
        gears="four"
        top="0px"
        bottom="0px"
        left="0px"
        right="0px"
        margin="80px"
        radius="40px"
        strokeColor={this.context.theme.palette.dark}
        fillColor={`radial-gradient(at 20% 20%, ${c1}, ${c2})`}
      />
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

    const contentView = viewImporter(routes['/content/'].component);
    const Content = Widget.WithRoute(
      contentView,
      ['context', 'view'],
      ['wid', 'did']
    )(routes['/content/'].path);

    const beforeView = viewImporter(routes['/before-content/'].component);
    const BeforeContent = Widget.WithRoute(beforeView, 'context')(
      routes['/before-content/'].path
    );

    const contentClass = this.showFooter
      ? this.styles.classNames.content
      : this.styles.classNames.contentWithoutfooter;

    return (
      <Container kind="root">
        {this.renderTaskBar(routes)}
        <Container kind="right">
          <Container kind="content">
            {this.renderTopBar(routes)}
            <BeforeContent desktopId={id} />
            <div className={contentClass}>
              {this.renderRetroPanel()}
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
