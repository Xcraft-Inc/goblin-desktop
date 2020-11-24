import React from 'react';
import Tab from 'goblin-desktop/widgets/tab/widget';
import Widget from 'goblin-laboratory/widgets/widget';
import Container from 'goblin-gadgets/widgets/container/widget';
import NotificationsButton from 'goblin-desktop/widgets/notifications-button/widget';

/******************************************************************************/

class Tabs extends Widget {
  constructor() {
    super(...arguments);
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
