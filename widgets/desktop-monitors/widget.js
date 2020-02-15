//T:2019-02-27
import React from 'react';
import Widget from 'goblin-laboratory/widgets/widget';
import * as styles from './styles';
import SamplesMonitor from 'goblin-gadgets/widgets/samples-monitor/widget';
import samplesMonitors from './samples-monitors';

/******************************************************************************/

class DesktopMonitors extends Widget {
  constructor() {
    super(...arguments);
    this.styles = styles;

    samplesMonitors.openChannel('activity', 100);
    this.timer = setInterval(() => this.update(), samplesMonitors.period);
  }

  componentWillUnmount() {
    super.componentWillUnmount();
    clearInterval(this.timer);

    samplesMonitors.closeChannel('activity');
  }

  update() {
    samplesMonitors.update('activity');

    if (this.props.monitorShowed) {
      this.forceUpdate();
    }
  }

  /******************************************************************************/

  render() {
    const monitorsSamples = this.props.monitorsSamples;
    for (const [channel, item] of monitorsSamples) {
      samplesMonitors.pushSample(channel, item.get('sample'));
    }

    const showed = !!this.props.monitorShowed;

    let style;

    if (this.props.monitorLook === 'modern') {
      style = showed
        ? this.styles.classNames.desktopMonitorsModern
        : this.styles.classNames.desktopMonitorsModernHidden;
    } else {
      style = showed
        ? this.styles.classNames.desktopMonitorsRetro
        : this.styles.classNames.desktopMonitorsRetroHidden;
    }

    let current = null;
    let total = null;
    if (showed) {
      const item = this.props.monitorsSamples.get(this.props.monitorShowed);
      if (item) {
        current = item.get('current');
        total = item.get('total');
      }
    }

    return (
      <div className={style}>
        <SamplesMonitor
          showed={showed}
          look={this.props.monitorLook}
          width="400px"
          height="300px"
          samples={samplesMonitors.getSamples(this.props.monitorShowed)}
          current={current}
          total={total}
        />
      </div>
    );
  }
}

/******************************************************************************/

export default Widget.connect((state, props) => {
  const monitorShowed = state.get(`backend.${props.id}.monitorShowed`);
  const monitorLook = state.get(`backend.${props.id}.monitorLook`);
  const monitorsSamples = state.get(`backend.${props.id}.monitorsSamples`);
  return {
    monitorShowed,
    monitorLook,
    monitorsSamples,
  };
})(DesktopMonitors);