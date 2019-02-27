//T:2019-02-27
import T from 't';
import React from 'react';
import Widget from 'laboratory/widget';
import Button from 'gadgets/button/widget';

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
          const show =
            state.get('showNotifications') === 'false' ? 'true' : 'false';
          this.doAs('desktop', 'set-notifications', {show});
        }}
      />
    );
  }
}

export default NotificationsButton;
