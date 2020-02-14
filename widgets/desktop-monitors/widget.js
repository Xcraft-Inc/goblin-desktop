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
    samplesMonitors.openChannel('hydrate', 100);

    this.timer = setInterval(() => this.update(), samplesMonitors.period);
  }

  componentWillUnmount() {
    super.componentWillUnmount();
    clearInterval(this.timer);

    samplesMonitors.closeChannel('activity');
    samplesMonitors.closeChannel('hydrate');
  }

  update() {
    samplesMonitors.update('activity');
    samplesMonitors.update('hydrate');

    if (this.props.monitorShowed) {
      this.forceUpdate();
    }
  }

  render() {
    const monitorsSamples = this.props.monitorsSamples;
    for (const [channel, item] of monitorsSamples) {
      samplesMonitors.pushSample(channel, item.get('sample'));
    }

    const showed = !!this.props.monitorShowed;
    const style = showed
      ? this.styles.classNames.desktopMonitors
      : this.styles.classNames.desktopMonitorsHidden;

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
  const monitorsSamples = state.get(`backend.${props.id}.monitorsSamples`);
  return {
    monitorShowed,
    monitorsSamples,
  };
})(DesktopMonitors);
