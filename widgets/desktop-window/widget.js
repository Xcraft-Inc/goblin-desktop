import React from 'react';
import Widget from 'goblin-laboratory/widgets/widget';
import importer from 'goblin_importer';
import MouseTrap from 'mousetrap';
import Container from 'goblin-gadgets/widgets/container/widget';
const viewImporter = importer('view');

class DesktopWindow extends Widget {
  constructor() {
    super(...arguments);
  }
  //#endregion

  static get wiring() {
    return {
      id: 'id',
      routesMap: 'routes',
    };
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

    const contentClass = this.styles.classNames.content;

    return (
      <Container kind="root">
        <div className={contentClass}>
          <Content desktopId={id} />
        </div>
      </Container>
    );
  }
}

/******************************************************************************/
export default Widget.Wired(DesktopWindow);
