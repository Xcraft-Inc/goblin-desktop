import React from 'react';
import Widget from 'goblin-laboratory/widgets/widget';
import * as styles from './styles';
import AnalogClock from 'goblin-gadgets/widgets/analog-clock/widget';

/******************************************************************************/

export default class DesktopClockClock extends Widget {
  constructor() {
    super(...arguments);
    this.styles = styles;

    this.onMouseOver = this.onMouseOver.bind(this);

    this.state = {
      clockHidden: false,
    };

    this.lastSize = this.props.size;
    this.lastLook = this.props.look;
    this.lastShowClock = false;
    this.lock = false;
  }

  //#region get/set
  get clockHidden() {
    return this.state.clockHidden;
  }

  set clockHidden(value) {
    this.setState({
      clockHidden: value,
    });
  }
  //#endregion

  doLock(delay) {
    this.lock = true;
    setTimeout(() => (this.lock = false), delay);
  }

  onMouseOver() {
    if (!this.props.showClock || this.lock) {
      return;
    }

    this.doLock(1000);
    this.clockHidden = true;
    setTimeout(() => (this.clockHidden = false), 2000);
  }

  render() {
    let clockHidden = this.clockHidden && this.props.showClock;

    if (
      this.props.size !== this.lastSize ||
      this.props.look !== this.lastLook ||
      (this.props.showClock && !this.lastShowClock)
    ) {
      clockHidden = false;
      this.lock = true;
      setTimeout(() => (this.lock = false), 1000);
    }

    this.lastSize = this.props.size;
    this.lastLook = this.props.look;
    this.lastShowClock = this.props.showClock;

    return (
      <div
        className={
          clockHidden
            ? this.styles.classNames.desktopClockClockHidden
            : this.styles.classNames.desktopClockClock
        }
        onClick={this.props.onClick}
        onMouseOver={this.onMouseOver}
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
