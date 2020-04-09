import React from 'react';
import Widget from 'goblin-laboratory/widgets/widget';
import * as styles from './styles';
import Button from 'goblin-gadgets/widgets/button/widget';
import Checkbox from 'goblin-gadgets/widgets/checkbox/widget';
import Label from 'goblin-gadgets/widgets/label/widget';
import AnalogClock from 'goblin-gadgets/widgets/analog-clock/widget';
import RetroPanel from 'goblin-gadgets/widgets/retro-panel/widget';
import {Unit} from 'electrum-theme';
import {ColorManipulator} from 'electrum-theme';

/******************************************************************************/

export default class DesktopClock extends Widget {
  constructor() {
    super(...arguments);
    this.styles = styles;

    this.toggleClock = this.toggleClock.bind(this);
    this.changeClockLook = this.changeClockLook.bind(this);

    this.state = {
      showClock: this.context.theme.look.clockParams
        ? this.context.theme.look.clockParams.initialVisibility
        : false,
      clockLook: this.context.theme.look.clockParams
        ? this.context.theme.look.clockParams.initialLook
        : null,
    };
  }

  //#region get/set
  get showClock() {
    return this.state.showClock;
  }

  set showClock(value) {
    this.setState({
      showClock: value,
    });
  }

  get clockLook() {
    return this.state.clockLook;
  }

  set clockLook(value) {
    this.setState({
      clockLook: value,
    });
  }
  //#endregion

  toggleClock() {
    this.showClock = !this.showClock;
  }

  changeClockLook() {
    const looks = this.context.theme.look.clockParams.looks;
    const i = looks.indexOf(this.clockLook);
    this.clockLook = looks[(i + 1) % looks.length];
  }

  /******************************************************************************/

  renderClock() {
    const showed = this.showClock;
    const style = showed
      ? this.styles.classNames.clockShowed
      : this.styles.classNames.clockHidden;

    return (
      <div
        className={style}
        onClick={this.showClock ? this.changeClockLook : this.toggleClock}
      >
        <AnalogClock
          size={this.context.theme.look.clockParams.size}
          look={
            this.showClock
              ? this.clockLook
              : this.context.theme.look.clockParams.miniLook
          }
        />
      </div>
    );
  }

  renderButtonRetro() {
    return (
      <RetroPanel
        position="relative"
        height="54px"
        width="250px"
        kind="metal-plate"
        margin="3px"
        radius="12px"
        flexDirection="row"
        justifyContent="center"
        alignItems="center"
        fillColor={ColorManipulator.darken(
          this.context.theme.palette.base,
          0.5
        )}
      >
        <Label
          width="80px"
          text="Time"
          wrap="no"
          fontSize="150%"
          textColor="#ccc"
        />
        <Checkbox
          backgroundBrigtness="dark"
          checked={this.showClock}
          onChange={this.toggleClock}
        />
        <div
          className={this.styles.classNames.miniClockRetro}
          onClick={this.toggleClock}
        />
      </RetroPanel>
    );
  }

  renderButtonModern() {
    return (
      <Button
        kind="button-footer"
        width={this.context.theme.shapes.footerHeight}
        glyph={this.showClock ? 'solid/eye-slash' : null}
        onClick={this.toggleClock}
      />
    );
  }

  renderButton() {
    if (this.context.theme.look.name === 'retro') {
      return this.renderButtonRetro();
    } else {
      return this.renderButtonModern();
    }
  }

  render() {
    if (this.context.theme.look.clock !== 'analog-clock') {
      return null;
    }

    return (
      <div className={this.styles.classNames.desktopClock}>
        {this.renderButton()}
        {this.renderClock()}
      </div>
    );
  }
}

/******************************************************************************/
