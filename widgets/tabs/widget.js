import T from 't';
import React from 'react';
import Button from 'goblin-gadgets/widgets/button/widget';
import Widget from 'goblin-laboratory/widgets/widget';
import Container from 'goblin-gadgets/widgets/container/widget';
import NotificationsButton from 'goblin-desktop/widgets/notifications-button/widget';
import Combo from 'gadgets/combo/widget';

const wireNotifsButton = Widget.Wired(NotificationsButton);

/******************************************************************************/

class Tabs extends Widget {
  constructor() {
    super(...arguments);

    this.state = {
      showMenu: false,
    };

    this.buttonNodes = {};

    this.goToWorkItem = this.goToWorkItem.bind(this);
    this.newWorkItem = this.newWorkItem.bind(this);
    this.closeWorkItem = this.closeWorkItem.bind(this);
  }

  static get wiring() {
    return {
      id: 'id',
      tabs: 'tabs',
      desktopId: 'desktopId',
    };
  }

  //#region get/set
  get showMenu() {
    return this.state.showMenu;
  }
  set showMenu(value) {
    this.setState({
      showMenu: value,
    });
  }
  //#endregion

  navToWorkItem(contextId, view, workitemId) {
    this.cmd('desktop.nav-to-workitem', {
      id: this.props.desktopId,
      contextId,
      view,
      workitemId,
      skipNav: false,
    });
  }

  clearWorkitem(contextId) {
    this.cmd('desktop.clear-workitem', {
      id: this.props.desktopId,
      contextId,
    });
  }

  goToWorkItem(k, v, isRightClick, workitemId, tabIsActive) {
    if (isRightClick) {
      // Right click.
      this.k = k;
      this.v = v;
      this.workitemId = workitemId;
      this.tabIsActive = tabIsActive;
      this.showMenu = true;
    } else {
      // Left click (standard click).
      this.navToWorkItem(this.props.context, v.get('view'), workitemId);
    }
  }

  newWorkItem(k, v, isRightClick, workitemId) {
    // TODO: Open new window...
    this.navToWorkItem(this.props.context, v.get('view'), workitemId);
  }

  closeWorkItem(k, v, isRightClick, workitemId, tabIsActive) {
    if (isRightClick) {
      // Right click.
      this.k = k;
      this.v = v;
      this.workitemId = workitemId;
      this.tabIsActive = tabIsActive;
      this.showMenu = true;
    } else {
      // Left click (standard click).
      this.do('remove', {
        tabId: workitemId,
        contextId: this.props.context,
        workitemId: workitemId,
        close: true,
        navToLastWorkitem: tabIsActive,
      });
    }
  }

  getMenuList() {
    const list = [];

    list.push({
      text: T('Ouvrir dans une autre fenêtre'),
      glyph: 'regular/window-maximize',
      action: () => this.newWorkItem(this.k, this.v, false, this.workitemId),
    });

    list.push({
      text: T('Fermer'),
      glyph: 'solid/times',
      action: () =>
        this.closeWorkItem(
          this.k,
          this.v,
          false,
          this.workitemId,
          this.tabIsActive
        ),
    });

    return list;
  }

  /******************************************************************************/

  renderMenu() {
    const node = this.buttonNodes[this.k];
    if (!this.showMenu || !node) {
      return null;
    }

    const rect = node.getBoundingClientRect();

    return (
      <Combo
        menuType="menu"
        left={rect.left + rect.width / 2}
        top={rect.bottom + 5}
        list={this.getMenuList()}
        close={() => (this.showMenu = false)}
      />
    );
  }

  renderButtonForEntity(k, v, workitemId, tabIsActive, entityId) {
    const Loader = (props) => {
      if (props.loaded) {
        return (
          <Button
            kind="view-tab-first"
            text={props.info || T('Nouveau', 'nouvelle fiche')}
            glyph={v.get('glyph')}
            active={tabIsActive}
            onClick={() =>
              this.goToWorkItem(k, v, false, workitemId, tabIsActive)
            }
            onRightClick={() =>
              this.goToWorkItem(k, v, true, workitemId, tabIsActive)
            }
          />
        );
      } else {
        return (
          <Button
            kind="view-tab-first"
            text={T('Chargement…')}
            glyph={v.get('glyph')}
            active={tabIsActive}
            onClick={() =>
              this.goToWorkItem(k, v, false, workitemId, tabIsActive)
            }
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
      <div
        key={k}
        ref={(x) => (this.buttonNodes[k] = x)}
        className={this.styles.classNames.tabsButton}
      >
        <EntityTab />
        <Button
          kind="view-tab-last"
          glyph="solid/times"
          show={v.get('closable', false)}
          active={tabIsActive}
          onClick={() =>
            this.closeWorkItem(k, v, false, workitemId, tabIsActive)
          }
          onRightClick={() =>
            this.closeWorkItem(k, v, true, workitemId, tabIsActive)
          }
        />
      </div>
    );
  }

  renderButtonForWorkitem(k, v, workitemId, tabIsActive) {
    return (
      <div
        key={k}
        ref={(x) => (this.buttonNodes[k] = x)}
        className={this.styles.classNames.tabsButton}
      >
        <Button
          kind="view-tab-first"
          text={v.get('name')}
          glyph={v.get('glyph')}
          active={tabIsActive}
          onClick={() =>
            this.goToWorkItem(k, v, false, workitemId, tabIsActive)
          }
          onRightClick={() =>
            this.goToWorkItem(k, v, true, workitemId, tabIsActive)
          }
        />
        <Button
          kind="view-tab-last"
          glyph="solid/times"
          show={v.get('closable', false)}
          active={tabIsActive}
          onClick={() =>
            this.closeWorkItem(k, v, false, workitemId, tabIsActive)
          }
          onRightClick={() =>
            this.closeWorkItem(k, v, true, workitemId, tabIsActive)
          }
        />
      </div>
    );
  }

  render() {
    const {currentTab, tabs, desktopId} = this.props;

    const WiredNotificationsButton = wireNotifsButton(desktopId);

    let contextTabs = tabs.get(this.props.context, null);
    if (contextTabs) {
      contextTabs = contextTabs.toArray();
    } else {
      contextTabs = [];
    }

    return (
      <Container kind="second-bar">
        <Container kind="view-tab">
          {contextTabs.map((v, k) => {
            const workitemId = v.get('workitemId');
            const entityId = v.get('entityId');
            const tabIsActive = currentTab === workitemId;
            if (entityId) {
              return this.renderButtonForEntity(
                k,
                v,
                workitemId,
                tabIsActive,
                entityId
              );
            } else {
              return this.renderButtonForWorkitem(
                k,
                v,
                workitemId,
                tabIsActive
              );
            }
          })}
        </Container>
        {this.renderMenu()}
        <Container kind="view-tab-right">
          <WiredNotificationsButton />
        </Container>
      </Container>
    );
  }
}

/******************************************************************************/

const TabsWithCurrent = Widget.connect((state, props) => {
  const currentTab = state.get(
    `backend.${props.desktopId}.current.workitems.${props.context}`
  );
  return {currentTab};
})(Tabs);

export default Widget.Wired(TabsWithCurrent)();
