import React from 'react';
import Widget from 'goblin-laboratory/widgets/widget';
import * as styles from './styles';
import AnalogClock from 'goblin-gadgets/widgets/analog-clock/widget';

/******************************************************************************/

export default class DesktopClockMenu extends Widget {
  constructor() {
    super(...arguments);
    this.styles = styles;
  }

  renderMenuItem(look, index) {
    return (
      <div
        key={index}
        className={
          look === this.props.selected
            ? this.styles.classNames.menuItemSelected
            : this.styles.classNames.menuItem
        }
        onClick={() => this.props.onSelect(look)}
      >
        <div
          className={`background-hover ${this.styles.classNames.background}`}
        />
        <div className={`clock-hover ${this.styles.classNames.clock}`}>
          <AnalogClock size={this.props.clockSize} look={look} />
        </div>
      </div>
    );
  }

  renderMenuItems() {
    const result = [];
    let index = 0;
    for (const look of this.props.looks) {
      result.push(this.renderMenuItem(look, index++));
    }
    return result;
  }

  render() {
    return (
      <div
        className={this.styles.classNames.fullScreen}
        onClick={this.props.onClose}
      >
        <div className={this.styles.classNames.desktopClockMenu}>
          {this.renderMenuItems()}
        </div>
      </div>
    );
  }
}

/******************************************************************************/
