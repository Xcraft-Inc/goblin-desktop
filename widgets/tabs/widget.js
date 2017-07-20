import React from 'react';
import Button from 'gadgets/button/widget';
import Widget from 'laboratory/widget';
import Container from 'gadgets/container/widget';
import NotificationsButton from 'desktop/notifications-button/widget';

const wireButton = Widget.Wired (Button);
const wireNotifsButton = Widget.Wired (NotificationsButton);
class Tabs extends Widget {
  constructor () {
    super (...arguments);
  }

  static get wiring () {
    return {
      id: 'id',
      tabs: 'tabs',
      desktopId: 'desktopId',
      current: 'current',
    };
  }

  navToWorkItem (contextId, view, workitemId) {
    this.nav (`/${contextId}/${view}?wid=${workitemId}`);
    this.cmd ('desktop.nav-to-workitem', {
      id: this.props.desktopId,
      contextId,
      view,
      workitemId,
      skipNav: true,
    });
  }

  goToWorkItem (contextId, view, workitemId) {
    this.do ('set-current', {contextId, workitemId});
    this.navToWorkItem (contextId, view, workitemId);
  }

  render () {
    const {context, current, tabs, desktopId} = this.props;

    let currentTab = null;
    if (current) {
      currentTab = current.get (context, null);
    }

    const WiredNotificationsButton = wireNotifsButton (desktopId);

    const contextTabs = tabs.get (context, []);
    return (
      <Container kind="second-bar">
        <Container kind="view-tab">
          {contextTabs.map ((v, k) => {
            const WiredButton = wireButton (k);
            const wid = v.get ('workitemId');
            return (
              <WiredButton
                key={k}
                id={k}
                onClick={() => this.goToWorkItem (context, v.get ('view'), wid)}
                active={currentTab === wid ? 'true' : 'false'}
              />
            );
          })}
        </Container>
        <Container kind="view-tab-right">
          <WiredNotificationsButton />
        </Container>
      </Container>
    );
  }
}

export default Tabs;
