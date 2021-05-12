import React from 'react';
import Widget from 'goblin-laboratory/widgets/widget';
import Shredder from 'xcraft-core-shredder';

import Label from 'goblin-gadgets/widgets/label/widget';
import Button from 'goblin-gadgets/widgets/button/widget';

/******************************************************************************/

class EntityAlerts extends Widget {
  constructor() {
    super(...arguments);

    this.state = {
      extended: false,
    };
  }

  //#region get/set
  get extended() {
    return this.state.extended;
  }
  set extended(value) {
    this.setState({
      extended: value,
    });
  }
  //#endregion

  renderAlert(alert, index) {
    const {type, message, count} = alert.pick('type', 'message', 'count');

    const style =
      type === 'warning'
        ? this.styles.classNames.entityAlertWarning
        : this.styles.classNames.entityAlertError;

    return (
      <div key={index} className={style}>
        <Label text={message} />
      </div>
    );
  }

  renderAlertExtended(alerts) {
    return alerts.map((alert, index) =>
      this.renderAlert(new Shredder(alert), index)
    );
  }

  renderAlertCompacted(alerts) {
    const nError = alerts.filter((a) => a.get('type') === 'error').size;
    const nWarning = alerts.filter((a) => a.get('type') === 'warning').size;

    const t = `${nError} erreurs, ${nWarning} avertissements`;

    return (
      <div className={this.styles.classNames.entityAlertCompacted}>
        <Label text={t} />
      </div>
    );
  }

  renderAlerts(alerts) {
    if (this.extended) {
      return this.renderAlertExtended(alerts);
    } else {
      return this.renderAlertCompacted(alerts);
    }
  }

  renderButton() {
    return (
      <div className={this.styles.classNames.button}>
        <Button
          glyph={this.extended ? 'solid/caret-up' : 'solid/caret-down'}
          border="none"
          width="30px"
          height="30px"
          onClick={() => (this.extended = !this.extended)}
        />
      </div>
    );
  }

  render() {
    const {alerts} = this.props;
    if (!alerts) {
      return null;
    }

    return (
      <div className={this.styles.classNames.entityAlerts}>
        {this.renderAlerts(alerts)}
        {this.renderButton()}
      </div>
    );
  }
}

/******************************************************************************/

const ConnectedEntityAlerts = Widget.connect((state, props) => {
  if (!props.entityId) {
    return {};
  }
  const alerts = state.get(`backend.${props.entityId}.meta.alerts`);
  if (!alerts) {
    return {};
  }
  return {
    alerts,
  };
})(EntityAlerts);

export default ConnectedEntityAlerts;
