//T:2019-02-27

import React from 'react';
import Widget from 'goblin-laboratory/widgets/widget';
import Shredder from 'xcraft-core-shredder';

/******************************************************************************/

class EntityAlerts extends Widget {
  constructor() {
    super(...arguments);
  }

  renderAlert(alert, index) {
    const {type, message, count} = alert.pick('type', 'message', 'count');
    return <div key={index}>{`${type} | ${message} (${count})`}</div>;
  }

  render() {
    const {alerts} = this.props;
    if (!alerts) {
      return null;
    }

    return alerts.map((alert, index) =>
      this.renderAlert(new Shredder(alert), index)
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
