import React from 'react';
import Widget from 'laboratory/widget';
import Button from 'gadgets/button/widget';

class NotificationsButton extends Widget {
  constructor (props) {
    super (props);
  }

  static get wiring () {
    return {
      id: 'id',
      notReadCount: 'notReadCount',
    };
  }

  render () {
    return (
      <Button
        text="Notifications"
        glyph="bell"
        glyphPosition="right"
        kind="view-tab-right"
        badgeValue={this.props.notReadCount}
        onClick={() => this.doAs ('desktop', 'toggle-notifications')}
      />
    );
  }
}

export default NotificationsButton;
