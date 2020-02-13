//T:2019-02-27
import React from 'react';
import Widget from 'goblin-laboratory/widgets/widget';
import * as styles from './styles';
import SamplesMonitor from 'goblin-gadgets/widgets/samples-monitor/widget';

/******************************************************************************/

export default class DesktopMonitors extends Widget {
  constructor() {
    super(...arguments);
    this.styles = styles;
    this.timer = setInterval(() => this.update(), this.props.period);
  }

  componentWillUnmount() {
    super.componentWillUnmount();
    clearInterval(this.timer);
  }

  update() {
    if (this.props.showed) {
      this.forceUpdate();
    }
  }

  render() {
    return (
      <div className={this.styles.classNames.desktopMonitors}>
        <SamplesMonitor
          showed={this.props.showed}
          width="400px"
          height="300px"
          samples={this.props.getSamples()}
        />
      </div>
    );
  }
}

/******************************************************************************/
