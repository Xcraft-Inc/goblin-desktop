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
  }

  static get wiring () {
    return {
      id: 'id',
      routesMap: 'routes',
      show: 'showNotifications',
      data: 'notifications',
    };
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

    this.shred (routesMap).select ((k, v) => {
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
              onClick={() => this.do ('change-mandate')}
            />
            <Tasks desktopId={id} />
          </Container>
        </Container>
        <Container kind="right">
          <Container kind="content">
            <Container kind="top-bar">
              <TopBar desktopId={id} />
            </Container>
            <BeforeContent desktopId={id} />
            <div className={contentClass}>
              <Content desktopId={id} />
              {this.renderNofications ()}
            </div>
            <Container kind="footer">
              <span>{id}</span>
            </Container>
          </Container>
        </Container>
      </Container>
    );
  }
}

export default Desktop;
