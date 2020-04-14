import React from 'react';
import Widget from 'goblin-laboratory/widgets/widget';
import * as styles from './styles';
import AnalogClock from 'goblin-gadgets/widgets/analog-clock/widget';

/******************************************************************************/

export default class DesktopClockClock extends Widget {
  constructor() {
    super(...arguments);
    this.styles = styles;
  }

  render() {
    return (
      <div
        className={this.styles.classNames.desktopClockClock}
        onClick={this.props.onClick}
      >
        <AnalogClock
          size={this.props.size}
          look={this.props.look}
          limit={this.props.showClock ? 1 : 3}
          transition="1.0s ease-out"
          mouseOver={this.props.mouseOver}
          mouseOut={this.props.mouseOut}
        />
      </div>
    );
  }
}

/******************************************************************************/
