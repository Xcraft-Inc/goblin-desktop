import React from 'react';
import Widget from 'goblin-laboratory/widgets/widget';
import Label from 'goblin-gadgets/widgets/label/widget';
import Button from 'goblin-gadgets/widgets/button/widget';
import Checkbox from 'goblin-gadgets/widgets/checkbox/widget';
import Screw from 'goblin-gadgets/widgets/screw/widget';
import Notification from 'goblin-gadgets/widgets/notification/widget';
import T from 't';

/******************************************************************************/

class Notifications extends Widget {
  constructor() {
    super(...arguments);

    this.handleToggleDnd = this.handleToggleDnd.bind(this);
    this.handleToggleOnlyNews = this.handleToggleOnlyNews.bind(this);
  }

  get hasNotifications() {
    return this.props.data && this.props.data.size > 0;
  }

  get isRetro() {
    return this.context.theme.look.name === 'retro';
  }

  handleToggleDnd() {
    const state = this.getBackendState();
    const show = state.get('dnd') === 'false' ? 'true' : 'false';
    this.doAs('desktop', 'set-dnd', {show});
  }

  handleToggleOnlyNews() {
    const state = this.getBackendState();
    const show = state.get('onlyNews') === 'false' ? 'true' : 'false';
    this.doAs('desktop', 'set-only-news', {show});
  }

  /******************************************************************************/

  renderScrews() {
    if (!this.isRetro) {
      return null;
    }

    return (
      <React.Fragment>
        <Screw background="dark" top="8px" left="8px" angle="-45deg" />
        <Screw background="dark" top="8px" right="8px" angle="70deg" />
        <Screw background="dark" bottom="8px" left="8px" angle="20deg" />
        <Screw background="dark" bottom="8px" right="8px" angle="-10deg" />
      </React.Fragment>
    );
  }

  renderCheckButton(checked, text, action) {
    if (this.isRetro) {
      return (
        <Checkbox
          background="dark"
          checked={checked}
          text={text}
          onChange={action}
        />
      );
    } else {
      return (
        <Checkbox
          kind="switch"
          glyphSize="170%"
          glyphColor={this.context.theme.palette.notificationText}
          textColor={this.context.theme.palette.notificationText}
          checked={checked}
          text={text}
          onChange={action}
        />
      );
    }
  }

  renderHeader() {
    return (
      <div className={this.styles.classNames.header}>
        {this.renderScrews()}
        <div className={this.styles.classNames.headerRow}>
          {this.renderCheckButton(
            this.props.dnd === 'true',
            T('Ne pas me déranger'),
            this.handleToggleDnd
          )}
        </div>
        <div className={this.styles.classNames.headerRow}>
          {this.renderCheckButton(
            this.props.onlyNews === 'true',
            T('Seulement les nouvelles'),
            this.handleToggleOnlyNews
          )}
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
    const props = {};

    if (notification.externalUrl) {
      props.onClick = () => {
        if (notification.isDownload) {
          this.doAs('desktop', 'download-file', {
            filePath: notification.externalUrl,
            openFile: true,
          });
        } else {
          this.cmd('client.open-external', {url: notification.externalUrl});
        }
      };
    }

    return (
      <Notification
        key={index}
        data={notification}
        status={notification.status}
        onClickNotification={() =>
          this.doAs('desktop', 'click-notification', {notification})
        }
        onDeleteNotification={() =>
          this.doAs('desktop', 'remove-notification', {notification})
        }
        {...props}
      />
    );
  }

  renderNotifications(notifications) {
    // The most recent notification first (on top).
    const nn = Widget.shred(notifications);
    let index = 0;
    return nn
      .sort((a, b) => b.get('order') - a.get('order'))
      .map(n => {
        if (n && n.toJS) {
          return this.renderNotification(n.toJS(), index++);
        }
      })
      .toArray();
  }

  renderPanel() {
    if (!this.props.data) {
      return null;
    }
    const notifications = this.props.data.filter(
      n => this.props.onlyNews === 'false' || n.get('status') === 'not-read'
    );
    if (notifications.size === 0) {
      return null;
    }

    return (
      <div className={this.styles.classNames.panel}>
        {this.renderNotifications(notifications)}
      </div>
    );
  }

  render() {
    if (!this.props.id) {
      return null;
    }

    return (
      <div className={this.styles.classNames.notifications}>
        {this.renderHeader()}
        {this.renderPanel()}
      </div>
    );
  }
}

/******************************************************************************/

const ConnectedNotifications = Widget.connect((state, props) => {
  const desktopState = state.get(`backend.${props.id}`);
  return {
    show: desktopState.get('showNotifications'),
    data: desktopState.get('notifications'),
    dnd: desktopState.get('dnd'),
    onlyNews: desktopState.get('onlyNews'),
  };
})(Notifications);

export default class extends Widget {
  render() {
    return (
      <ConnectedNotifications labId={this.context.labId} {...this.props} />
    );
  }
}
