import React from 'react';
import Tab from 'goblin-desktop/widgets/tab/widget';
import Widget from 'goblin-laboratory/widgets/widget';
import Container from 'goblin-gadgets/widgets/container/widget';
import NotificationsButton from 'goblin-desktop/widgets/notifications-button/widget';

/******************************************************************************/

class Tabs extends Widget {
  constructor() {
    super(...arguments);
    this.goToWorkItem = this.goToWorkItem.bind(this);
    this.newWorkItem = this.newWorkItem.bind(this);
    this.closeWorkItem = this.closeWorkItem.bind(this);
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
    this.cmd('desktop.open-tab-to-window', {
      id: this.props.desktopId,
      contextId: this.props.context,
      workitemId,
    });
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

  /******************************************************************************/

  renderTabs() {
    const {id, workitems, context} = this.props;
    return workitems.map((wid) => {
      return <Tab key={wid} id={wid} desktopId={id} context={context} />;
    });
  }

  render() {
    const {desktopId, workitems} = this.props;
    return (
      <Container kind="second-bar">
        <Container kind="view-tab">
          {workitems ? this.renderTabs() : null}
        </Container>
        <Container kind="view-tab-right">
          <NotificationsButton id={desktopId} />
        </Container>
      </Container>
    );
  }
}

/******************************************************************************/

const TabsWithCurrent = Widget.connect((state, props) => {
  const context = state.get(`backend.${props.id}.current.workcontext`);
  const workitems = state.get(
    `backend.${props.id}.workitemsByContext.${context}`
  );
  return {workitems, context};
})(Tabs);

export default TabsWithCurrent;
