import React from 'react';
import Widget from 'laboratory/widget';
import importer from 'laboratory/importer/';

import Container from 'gadgets/container/widget';
import Button from 'gadgets/button/widget';
import Notifications from 'desktop/notifications/widget';

const wiredNotifications = Widget.Wired (Notifications);
const viewImporter = importer ('view');

class Desktop extends Widget {
  constructor () {
    super (...arguments);
    this.onChangeScreen = ::this.onChangeScreen;
    this.onChangeMandate = ::this.onChangeMandate;
  }

  static get wiring () {
    return {
      id: 'id',
      username: 'username',
      routesMap: 'routes',
      show: 'showNotifications',
      data: 'notifications',
    };
  }

  onChangeScreen () {
    this.do ('change-screen');
  }

  onChangeMandate () {
    this.do ('change-mandate');
  }

  renderNofications () {
    const WiredNotifications = wiredNotifications (this.props.id);

    return <WiredNotifications />;
  }

  render () {
    const {id, routesMap} = this.props;

    if (!id) {
      return null;
    }

    const routes = {
      '/hinter/': {},
      '/task-bar/': {},
      '/top-bar/': {},
      '/before-content/': {},
      '/content/': {},
    };

    Widget.shred (routesMap).select ((k, v) => {
      const ex = /^(\/.[:\-a-z]+\/).*/;
      const res = ex.exec (v);
      let mount = '/';
      if (res) {
        mount = res[1];
      }
      if (routes[mount]) {
        routes[mount] = {path: v.replace (mount, '/'), component: k};
      } else {
        console.warn (`Invalid mount point ${mount} for ${k}`);
      }
    });

    const taskView = viewImporter (routes['/task-bar/'].component);
    const Tasks = Widget.WithRoute (taskView, 'context') (
      routes['/task-bar/'].path
    );

    const contentView = viewImporter (routes['/content/'].component);
    const Content = Widget.WithRoute (contentView, 'view', 'wid') (
      routes['/content/'].path
    );

    const topbarView = viewImporter (routes['/top-bar/'].component);
    const TopBar = Widget.WithRoute (topbarView, 'context') (
      routes['/top-bar/'].path
    );

    const beforeView = viewImporter (routes['/before-content/'].component);
    const BeforeContent = Widget.WithRoute (beforeView, 'context') (
      routes['/before-content/'].path
    );

    const contentClass = this.styles.classNames.content;

    return (
      <Container kind="root">
        <Container kind="left-bar">
          <Container kind="task-bar">
            <Button
              textTransform="none"
              text="Poly"
              glyph="cube"
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
                  glyph="tv"
                  kind="main-tab-right"
                  onClick={this.onChangeScreen}
                />
                {window.zoomable
                  ? <Button
                      glyph="plus"
                      kind="main-tab-right"
                      onClick={() => {
                        window.zoom ();
                      }}
                    />
                  : null}
                {window.zoomable
                  ? <Button
                      glyph="minus"
                      kind="main-tab-right"
                      onClick={() => {
                        window.unZoom ();
                      }}
                    />
                  : null}
                <Button text={this.props.username} kind="main-tab-right" />
              </Container>
            </Container>
            <BeforeContent desktopId={id} />
            <div className={contentClass}>
              <Content desktopId={id} />
              {this.renderNofications ()}
            </div>
            <Container kind="footer" />
          </Container>
        </Container>
      </Container>
    );
  }
}

export default Desktop;
