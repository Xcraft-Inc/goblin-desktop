//T:2019-02-27

import React from 'react';
import Widget from 'laboratory/widget';

import Label from 'gadgets/label/widget';
import Button from 'gadgets/button/widget';
import Notification from 'gadgets/notification/widget';
import T from 't';

/******************************************************************************/

class Notifications extends Widget {
  constructor() {
    super(...arguments);
  }

  static get wiring() {
    return {
      id: 'id',
      show: 'showNotifications',
      data: 'notifications',
      dnd: 'dnd',
      onlyNews: 'onlyNews',
    };
  }

  get hasNotifications() {
    return this.props.data && this.props.data.size > 0;
  }

  renderHeader() {
    const headerClass = this.styles.classNames.header;
    const headerRowClass = this.styles.classNames.headerRow;

    return (
      <div className={headerClass}>
        <div className={headerRowClass}>
          <Button
            glyph={
              this.props.dnd === 'true' ? 'light/toggle-on' : 'light/toggle-off'
            }
            text={T('Ne pas me déranger')}
            kind="button-notification"
            onClick={() => {
              const state = this.getBackendState();
              const show = state.get('dnd') === 'false' ? 'true' : 'false';
              this.doAs('desktop', 'set-dnd', {show});
            }}
          />
        </div>
        <div className={headerRowClass}>
          <Button
            glyph={
              this.props.onlyNews === 'true'
                ? 'light/toggle-on'
                : 'light/toggle-off'
            }
            text={T('Seulement les nouvelles')}
            kind="button-notification"
            onClick={() => {
              const state = this.getBackendState();
              const show = state.get('onlyNews') === 'false' ? 'true' : 'false';
              this.doAs('desktop', 'set-only-news', {show});
            }}
          />
          <Label grow="1" />
          <Button
            disabled={this.hasNotifications ? 'false' : 'true'}
            text={T('Tout effacer')}
            kind="button-notification"
            onClick={() => this.doAs('desktop', 'remove-notifications')}
          />
        </div>
      </div>
    );
  }

  renderNotification(notification, index) {
    return (
      <Notification
        key={index}
        data={notification}
        status={notification.status}
        onClick={() => {
          if (notification.externalUrl) {
            this.cmd('client.open-external', {url: notification.externalUrl});
          }
        }}
        onClickNotification={() =>
          this.doAs('desktop', 'click-notification', {notification})
        }
        onDeleteNotification={() =>
          this.doAs('desktop', 'remove-notification', {notification})
        }
      />
    );
  }

  renderNotifications(notifications) {
    if (!notifications || notifications.size === 0) {
      return null;
    }
    // The most recent notification first (on top).
    const nn = Widget.shred(notifications);
    let index = 0;
    return nn
      .map(n => {
        if (this.props.onlyNews === 'false' || n.get('status') === 'not-read') {
          return n;
        }
      })
      .sort((a, b) => b.get('order') - a.get('order'))
      .map(n => {
        return this.renderNotification(n.toJS(), index++);
      })
      .toArray();
  }

  render() {
    if (!this.props.id) {
      return null;
    }

    const data = this.props.data;
    const show = this.props.show;

    const panelClass =
      show === 'true'
        ? this.styles.classNames.panel
        : this.styles.classNames.panelHidden;
    const notificationsClass = this.styles.classNames.notifications;

    return (
      <div className={panelClass}>
        {this.renderHeader()}
        <div className={notificationsClass}>
          {this.renderNotifications(data)}
        </div>
      </div>
    );
  }
}

/******************************************************************************/
export default Notifications;
