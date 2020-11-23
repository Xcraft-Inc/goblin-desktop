//T:2019-02-27
import T from 't';
import React from 'react';
import Widget from 'goblin-laboratory/widgets/widget';
import Button from 'goblin-gadgets/widgets/button/widget';

class NotificationsButton extends Widget {
  constructor() {
    super(...arguments);
  }

  static get wiring() {
    return {
      id: 'id',
      notReadCount: 'notReadCount',
    };
  }

  render() {
    return (
      <Button
        text={T('Notifications')}
        glyph="solid/bell"
        glyphPosition="right"
        kind="view-tab-right"
        badgeValue={this.props.notReadCount}
        onClick={() => {
          const state = this.getBackendState();
          const show = !state.get('showNotifications');
          this.doAs('desktop', 'set-notifications', {show});
        }}
      />
    );
  }
}

export default Widget.Wired(NotificationsButton)();
