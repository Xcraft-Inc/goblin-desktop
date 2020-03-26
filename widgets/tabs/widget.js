//T:2019-02-27
import T from 't';
import React from 'react';
import Button from 'goblin-gadgets/widgets/button/widget';
import Widget from 'goblin-laboratory/widgets/widget';
import Container from 'goblin-gadgets/widgets/container/widget';
import NotificationsButton from 'goblin-desktop/widgets/notifications-button/widget';

const wireNotifsButton = Widget.Wired(NotificationsButton);
class Tabs extends Widget {
  constructor() {
    super(...arguments);
  }

  static get wiring() {
    return {
      id: 'id',
      tabs: 'tabs',
      desktopId: 'desktopId',
      current: 'current',
    };
  }

  navToWorkItem(contextId, view, workitemId) {
    this.nav(`/${contextId}/${view}?wid=${workitemId}`);
    this.cmd('desktop.nav-to-workitem', {
      id: this.props.desktopId,
      contextId,
      view,
      workitemId,
      skipNav: true,
    });
  }

  navToContext(contextId) {
    this.nav(`/${contextId}/?wid=null`);
  }

  goToWorkItem(contextId, view, workitemId) {
    this.do('set-current', {contextId, workitemId});
    this.navToWorkItem(contextId, view, workitemId);
  }

  clearWorkitem(contextId) {
    this.do('set-current', {contextId, workitemId: null});
    this.cmd('desktop.clear-workitem', {
      id: this.props.desktopId,
      contextId,
    });
  }

  render() {
    const {context, current, tabs, desktopId} = this.props;

    let currentTab = null;
    if (current) {
      currentTab = current.get(context, null);
    }

    const WiredNotificationsButton = wireNotifsButton(desktopId);

    let contextTabs = tabs.get(context, null);
    if (contextTabs) {
      contextTabs = contextTabs.toArray();
    } else {
      contextTabs = [];
    }
    return (
      <Container kind="second-bar">
        <Container kind="view-tab">
          {contextTabs.map((v, k) => {
            const wid = v.get('workitemId');
            const closable = v.get('closable', false);
            const show = closable;
            const name = v.get('name');
            const entityId = v.get('entityId');
            if (entityId) {
              const Loader = props => {
                if (props.loaded) {
                  return (
                    <Button
                      text={props.info || T('Nouveau', 'nouvelle fiche')}
                      kind="view-tab-first"
                      glyph={v.get('glyph')}
                      onClick={() =>
                        this.goToWorkItem(context, v.get('view'), wid)
                      }
                      active={currentTab === wid}
                    />
                  );
                } else {
                  return (
                    <Button
                      text={T('Chargement…')}
                      kind="view-tab-first"
                      glyph={v.get('glyph')}
                      onClick={() =>
                        this.goToWorkItem(context, v.get('view'), wid)
                      }
                      active={currentTab === wid}
                    />
                  );
                }
              };

              const EntityTab = this.mapWidget(
                Loader,
                info => {
                  switch (info) {
                    case undefined:
                    case null:
                      return {loaded: false, info};
                    default:
                      return {loaded: true, info};
                  }
                },
                `backend.${entityId}.meta.summaries.info`
              );
              return (
                <Container kind="row" key={k}>
                  <EntityTab />
                  <Button
                    glyph="solid/times"
                    kind="view-tab-last"
                    show={show}
                    onClick={() => {
                      this.do('remove', {
                        tabId: wid,
                        contextId: context,
                        workitemId: wid,
                        close: true,
                      });
                    }}
                    active={currentTab === wid}
                  />
                </Container>
              );
            } else {
              return (
                <Container kind="row" key={k}>
                  <Button
                    text={name}
                    kind="view-tab-first"
                    glyph={v.get('glyph')}
                    onClick={() =>
                      this.goToWorkItem(context, v.get('view'), wid)
                    }
                    active={currentTab === wid}
                  />
                  <Button
                    glyph="solid/times"
                    kind="view-tab-last"
                    show={show}
                    onClick={() => {
                      this.do('remove', {
                        tabId: wid,
                        contextId: context,
                        workitemId: wid,
                        close: true,
                      });
                    }}
                    active={currentTab === wid}
                  />
                </Container>
              );
            }
          })}
        </Container>
        <Container kind="view-tab-right">
          <WiredNotificationsButton />
        </Container>
      </Container>
    );
  }
}

export default Widget.Wired(Tabs)();
