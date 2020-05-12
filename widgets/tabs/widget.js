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
    };
  }

  navToWorkItem(contextId, view, workitemId) {
    this.cmd('desktop.nav-to-workitem', {
      id: this.props.desktopId,
      contextId,
      view,
      workitemId,
      skipNav: false,
    });
  }

  goToWorkItem(contextId, view, workitemId) {
    this.navToWorkItem(contextId, view, workitemId);
  }

  clearWorkitem(contextId) {
    this.cmd('desktop.clear-workitem', {
      id: this.props.desktopId,
      contextId,
    });
  }

  render() {
    const {context, currentTab, tabs, desktopId} = this.props;

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
            const tabIsActive = currentTab === wid;
            if (entityId) {
              const Loader = (props) => {
                if (props.loaded) {
                  return (
                    <Button
                      text={props.info || T('Nouveau', 'nouvelle fiche')}
                      kind="view-tab-first"
                      glyph={v.get('glyph')}
                      onClick={() =>
                        this.goToWorkItem(context, v.get('view'), wid)
                      }
                      active={tabIsActive}
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
                      active={tabIsActive}
                    />
                  );
                }
              };

              const EntityTab = this.mapWidget(
                Loader,
                (info) => {
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
                        navToLastWorkitem: tabIsActive,
                      });
                    }}
                    active={tabIsActive}
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
                    active={tabIsActive}
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
                        navToLastWorkitem: tabIsActive,
                      });
                    }}
                    active={tabIsActive}
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

const TabsWithCurrent = Widget.connect((state, props) => {
  const currentTab = state.get(
    `backend.${props.desktopId}.current.workitems.${props.context}`
  );
  return {currentTab};
})(Tabs);

export default Widget.Wired(TabsWithCurrent)();
