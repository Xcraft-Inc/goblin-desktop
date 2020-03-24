//T:2019-02-27
import React from 'react';
import Widget from 'goblin-laboratory/widgets/widget';
import importer from 'goblin_importer';
import Container from 'goblin-gadgets/widgets/container/widget';
import DesktopTaskbar from 'goblin-desktop/widgets/desktop-taskbar/widget';
import DesktopTopbar from 'goblin-desktop/widgets/desktop-topbar/widget';
import DesktopNotifications from 'goblin-desktop/widgets/desktop-notifications/widget';
import DesktopFooter from 'goblin-desktop/widgets/desktop-footer/widget';
const viewImporter = importer('view');
import RetroPanel from 'goblin-gadgets/widgets/retro-panel/widget';
import {ColorManipulator} from 'electrum-theme';

/******************************************************************************/

export default class Desktop extends Widget {
  constructor() {
    super(...arguments);

    this.state = {
      showFooter: true,
    };

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
      username: 'username',
    };
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
    return (
      <DesktopTopbar
        id={this.props.id}
        routes={routes}
        username={this.props.username}
      />
    );
  }

  renderNofications() {
    return <DesktopNotifications id={this.props.id} />;
  }

  renderFooter() {
    return <DesktopFooter id={this.props.id} showFooter={this.showFooter} />;
  }

  renderRetroPanel() {
    if (this.context.theme.look.name !== 'retro') {
      return null;
    }

    const c1 = ColorManipulator.darken(this.context.theme.palette.base, 0.1);
    const c2 = ColorManipulator.darken(this.context.theme.palette.base, 0.4);

    return (
      <RetroPanel
        position="absolute"
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
