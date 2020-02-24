import React from 'react';
import Widget from 'goblin-laboratory/widgets/widget';
import Label from 'goblin-gadgets/widgets/label/widget';
import Button from 'goblin-gadgets/widgets/button/widget';
import Checkbox from 'goblin-gadgets/widgets/checkbox/widget';
import Notification from 'goblin-gadgets/widgets/notification/widget';
import T from 't';

/******************************************************************************/

class Notifications extends Widget {
  constructor() {
    super(...arguments);

    this.handleToggleDnd = this.handleToggleDnd.bind(this);
    this.handleToggleOnlyNews = this.handleToggleOnlyNews.bind(this);
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

  get isRetro() {
    return this.props.monitorLook === 'retro';
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

  renderScrew(styleMain, styleSlot) {
    return (
      <React.Fragment>
        <div className={styleMain} />
        <div className={styleSlot} />
      </React.Fragment>
    );
  }

  renderScrews() {
    if (this.props.monitorLook !== 'retro') {
      return null;
    }

    return (
      <React.Fragment>
        {this.renderScrew(
          this.styles.classNames.screwMainTopLeft,
          this.styles.classNames.screwSlotTopLeft
        )}
        {this.renderScrew(
          this.styles.classNames.screwMainTopRight,
          this.styles.classNames.screwSlotTopRight
        )}
        {this.renderScrew(
          this.styles.classNames.screwMainBottomLeft,
          this.styles.classNames.screwSlotBottomLeft
        )}
        {this.renderScrew(
          this.styles.classNames.screwMainBottomRight,
          this.styles.classNames.screwSlotBottomRight
        )}
      </React.Fragment>
    );
  }

  renderCheckButton(checked, text, action) {
    if (this.isRetro) {
      return (
        <Checkbox
          kind="retro"
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
    const headerClass = this.isRetro
      ? this.styles.classNames.headerRetro
      : this.styles.classNames.headerModern;

    const headerRowClass = this.isRetro
      ? this.styles.classNames.headerRowRetro
      : this.styles.classNames.headerRowModern;

    return (
      <div className={headerClass}>
        {this.renderScrews()}
        <div className={headerRowClass}>
          {this.renderCheckButton(
            this.props.dnd === 'true',
            T('Ne pas me déranger'),
            this.handleToggleDnd
          )}
        </div>
        <div className={headerRowClass}>
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
        look={this.props.monitorLook}
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

    const style = this.isRetro
      ? this.styles.classNames.notificationsRetro
      : this.styles.classNames.notificationsModern;

    return (
      <div className={style}>{this.renderNotifications(notifications)}</div>
    );
  }

  render() {
    if (!this.props.id) {
      return null;
    }

    const show = this.props.show;
    let panelClass;
    if (this.isRetro) {
      panelClass =
        show === 'true'
          ? this.styles.classNames.notificationsShowedRetro
          : this.styles.classNames.notificationsHiddenRetro;
    } else {
      panelClass =
        show === 'true'
          ? this.styles.classNames.notificationsShowedModern
          : this.styles.classNames.notificationsHiddenModern;
    }

    return (
      <div className={panelClass}>
        {this.renderHeader()}
        {this.renderPanel()}
      </div>
    );
  }
}

/******************************************************************************/

export default Widget.connect((state, props) => {
  const monitorLook = state.get(`backend.${props.id}.monitorLook`);
  return {
    monitorLook,
  };
})(Notifications);
