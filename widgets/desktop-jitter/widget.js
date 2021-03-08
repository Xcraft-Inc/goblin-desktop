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
  }

  get showDialog() {
    return this.props.dialogVisibility;
  }

  set showDialog(value) {
    this.dispatchTo(this.widgetId, {
      type: value ? 'SHOW_DIALOG' : 'HIDE_DIALOG',
    });
  }

  onToggleDialog() {
    this.showDialog = !this.showDialog;
  }

  renderDialog(horde, color, samples, currentValue) {
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
            bottomSpacing="large"
            singleLine={true}
            text={T(
              '{horde}: {jitter, select, Infinity {💔} other {{jitter} ms}}',
              '',
              {
                horde,
                jitter: currentValue,
              }
            )}
          />
          <SamplesMonitor
            id={this.props.id}
            showed={true}
            mode="separate"
            disableRightPanel={true}
            chartMargin={5}
            channels={[{name: 'JITTER', samples, max: 1000}]}
            backgroundColor="transparent"
            strokeColors={['#333']}
            width="250px"
            height="150px"
          />
        </div>
      </div>
    );
  }

  renderJitter(horde, samples, noJitter) {
    let color;
    const currentValue = noJitter ? Infinity : samples.get(0);
    if (currentValue < 125) {
      color = '#00ff00'; // green
    } else if (currentValue < 250) {
      color = '#ffff00'; // yellow
    } else if (currentValue < 500) {
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
          className={noJitter && this.styles.classNames.blink}
        />
        {this.renderDialog(horde, color, samples, currentValue)}
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

const DesktopJitter = Widget.connect((state, props) => {
  const stateWidgets = state.get('widgets').get(props.id);
  const stateNetwork = state.get('network');

  const hordes = stateNetwork.get(`jitter`);
  const noJitter = stateNetwork.get(`noJitter`);
  const dialogVisibility = stateWidgets
    ? stateWidgets.get('dialogVisibility')
    : false;
  return {hordes, noJitter, dialogVisibility};
})(DesktopJitterNC);

export default DesktopJitter;