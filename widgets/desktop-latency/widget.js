import React from 'react';
import Widget from 'goblin-laboratory/widgets/widget';
import T from 't';
import Button from 'goblin-gadgets/widgets/button/widget';
import {ColorManipulator} from 'goblin-theme';

/******************************************************************************/

class DesktopLatencyNC extends Widget {
  constructor() {
    super(...arguments);

    this.onChart = this.onChart.bind(this);
  }

  onChart(horde, latency) {}

  renderLatency(horde, latency, noLatency) {
    let color;
    const _latency = noLatency ? Infinity : latency.get(0);
    if (_latency < 100) {
      color = '#00ff00'; // green
    } else if (_latency < 200) {
      color = '#ffff00'; // yellow
    } else if (_latency < 500) {
      color = '#ff7f00'; // orange
    } else {
      color = '#ff0000'; // red
    }

    return (
      <Button
        key={horde}
        kind="main-tab-right"
        glyph="solid/signal"
        glyphColor={ColorManipulator.darken(color, 0.4)}
        tooltip={T('Latence avec le serveur {horde} : {latency} ms', '', {
          horde,
          latency: _latency,
        })}
        onClick={() => this.onChart(horde, latency)}
      />
    );
  }

  render() {
    const {hordes, noLatency} = this.props;
    if (!hordes) {
      return null;
    }

    return hordes
      .entrySeq()
      .map(([horde, latency]) => this.renderLatency(horde, latency, noLatency));
  }
}

/******************************************************************************/

const DesktopLatency = Widget.connect((state) => {
  const hordes = state.get(`network.latency`);
  const noLatency = state.get(`network.noLatency`);
  return {hordes, noLatency};
})(DesktopLatencyNC);

export default DesktopLatency;
