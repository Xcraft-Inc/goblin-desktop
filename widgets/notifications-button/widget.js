//T:2019-02-27
import T from 't';
import React from 'react';
import Widget from 'goblin-laboratory/widgets/widget';
import Button from 'goblin-gadgets/widgets/button/widget';
import SFX from '../audio/sfx.js';

class NotificationsButton extends Widget {
  constructor() {
    super(...arguments);
    this.toggle = this.toggle.bind(this);
  }

  static get wiring() {
    return {
      id: 'id',
      notReadCount: 'notReadCount',
    };
  }

  toggle() {
    const state = this.getBackendState();
    const show = !state.get('showNotifications');
    if (show) {
      SFX.zim.play();
    }
    this.doAs('desktop', 'set-notifications', {show});
  }

  render() {
    return (
      <Button
        text={T('Notifications')}
        glyph="solid/bell"
        glyphPosition="right"
        kind="view-tab-right"
        badgeValue={this.props.notReadCount}
        onClick={this.toggle}
      />
    );
  }
}

export default Widget.Wired(NotificationsButton)();
