import React from 'react';
import Widget from 'goblin-laboratory/widgets/widget';
import * as styles from './styles';
import T from 't';
import Button from 'goblin-gadgets/widgets/button/widget';
import Label from 'goblin-gadgets/widgets/label/widget';
import {ColorManipulator} from 'goblin-theme';

/******************************************************************************/

class DesktopLatencyNC extends Widget {
  constructor() {
    super(...arguments);
    this.styles = styles;

    this.onToggleDialog = this.onToggleDialog.bind(this);

    this.state = {
      showDialog: false,
    };
  }

  get showDialog() {
    return this.state.showDialog;
  }
  set showDialog(value) {
    this.setState({
      showDialog: value,
    });
  }

  onToggleDialog() {
    this.showDialog = !this.showDialog;
  }

  renderDialog(horde, latency, color) {
    if (!this.showDialog) {
      return null;
    }

    return (
      <div className={this.styles.classNames.dialog}>
        <Label
          width="50px"
          glyph="solid/signal"
          glyphColor={color}
          glyphSize="150%"
        />
        <div className={this.styles.classNames.list}>
          <Label fontWeight="bold" text={T('Latence')} />
          <Label
            text={T(
              '{horde} : {latency, select, Infinity {inconnu} other {{latency} ms}}',
              '',
              {
                horde,
                latency,
              }
            )}
          />
        </div>
      </div>
    );
  }

  renderLatency(horde, latency, noLatency) {
    let color;
    const _latency = noLatency ? Infinity : latency.get(0);
    if (_latency < 100) {
      color = '#00ff00'; // green
    } else if (_latency < 250) {
      color = '#ffff00'; // yellow
    } else if (_latency < 500) {
      color = '#ff7f00'; // orange
    } else {
      color = '#ff0000'; // red
    }
    color = ColorManipulator.darken(color, 0.4);

    return (
      <React.Fragment key={`${horde}_btn`}>
        <Button
          kind="main-tab-right"
          glyph="solid/signal"
          glyphColor={color}
          onClick={() => this.onToggleDialog()}
        />
        {this.renderDialog(horde, _latency, color)}
      </React.Fragment>
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
