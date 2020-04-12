import React from 'react';
import Widget from 'goblin-laboratory/widgets/widget';
import * as styles from './styles';
import Container from 'goblin-gadgets/widgets/container/widget';
import AnalogClock from 'goblin-gadgets/widgets/analog-clock/widget';

/******************************************************************************/

function isInside(rect, x, y) {
  if (rect && rect.left < rect.right && rect.top < rect.bottom) {
    return (
      x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom
    );
  } else {
    return true;
  }
}

/******************************************************************************/

export default class DesktopClockMenu extends Widget {
  constructor() {
    super(...arguments);
    this.styles = styles;

    this.onClickFullScreen = this.onClickFullScreen.bind(this);
  }

  onClickFullScreen(e) {
    this.props.onClose();
  }

  /******************************************************************************/

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
        <AnalogClock size="180px" look={look} />
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
        ref={(node) => (this.node = node)}
        className={this.styles.classNames.fullScreen}
        onClick={this.onClickFullScreen}
      >
        <div className={this.styles.classNames.menu}>
          {this.renderMenuItems()}
        </div>
      </div>
    );
  }
}

/******************************************************************************/
