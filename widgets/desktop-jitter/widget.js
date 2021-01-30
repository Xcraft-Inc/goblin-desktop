import React from 'react';
import Widget from 'goblin-laboratory/widgets/widget';
import * as styles from './styles';
import T from 't';
import Button from 'goblin-gadgets/widgets/button/widget';
import Label from 'goblin-gadgets/widgets/label/widget';
import SamplesMonitor from 'goblin-gadgets/widgets/samples-monitor/widget';
import {ColorManipulator} from 'goblin-theme';

/******************************************************************************/

class DesktopJitterNC extends Widget {
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

  renderDialog(horde, jitter, color, samples) {
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
          <Label fontWeight="bold" text={T('Network')} />
          <Label
            text={T(
              '{horde} : {jitter, select, Infinity {unknown} other {{jitter} ms}}',
              '',
              {
                horde,
                jitter,
              }
            )}
          />
          <SamplesMonitor
            id={this.props.id}
            showed={true}
            mode="separate"
            disableRightPanel={true}
            look="simple"
            chartMarginLeft={5}
            chartMarginRight={5}
            channels={[{name: 'jitter', samples, max: 1000}]}
            strokeColors={['#333']}
            width="280px"
            height="150px"
          />
        </div>
      </div>
    );
  }

  renderJitter(horde, jitter, noJitter) {
    let color;
    const _jitter = noJitter ? Infinity : jitter.get(0);
    if (_jitter < 100) {
      color = '#00ff00'; // green
    } else if (_jitter < 250) {
      color = '#ffff00'; // yellow
    } else if (_jitter < 500) {
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
        {this.renderDialog(horde, _jitter, color, jitter)}
      </React.Fragment>
    );
  }

  render() {
    const {hordes, noJitter} = this.props;
    if (!hordes) {
      return null;
    }

    return hordes
      .entrySeq()
      .map(([horde, jitter]) => this.renderJitter(horde, jitter, noJitter));
  }
}

/******************************************************************************/

const DesktopJitter = Widget.connect((state) => {
  const hordes = state.get(`network.jitter`);
  const noJitter = state.get(`network.noJitter`);
  return {hordes, noJitter};
})(DesktopJitterNC);

export default DesktopJitter;
