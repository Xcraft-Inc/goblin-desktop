import React from 'react';
import Widget from 'goblin-laboratory/widgets/widget';
import * as styles from './styles';
import Button from 'goblin-gadgets/widgets/button/widget';
import Checkbox from 'goblin-gadgets/widgets/checkbox/widget';
import Label from 'goblin-gadgets/widgets/label/widget';
import AnalogClock from 'goblin-gadgets/widgets/analog-clock/widget';
import RetroPanel from 'goblin-gadgets/widgets/retro-panel/widget';
import DesktopClockMenu from 'goblin-desktop/widgets/desktop-clock-menu/widget';
import {ColorManipulator} from 'electrum-theme';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';

/******************************************************************************/

export default class DesktopClock extends Widget {
  constructor() {
    super(...arguments);
    this.styles = styles;

    this.toggleClock = this.toggleClock.bind(this);
    this.changeClockLook = this.changeClockLook.bind(this);
    this.clockMouseOver = this.clockMouseOver.bind(this);
    this.clockMouseOut = this.clockMouseOut.bind(this);

    this.state = {
      showClock: this.context.theme.look.clockParams
        ? this.context.theme.look.clockParams.initialVisibility
        : false,
      clockLook: this.context.theme.look.clockParams
        ? this.context.theme.look.clockParams.initialLook
        : null,
      mouseInClock: false,
      showMenu: false,
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

  get mouseInClock() {
    return this.state.mouseInClock;
  }

  set mouseInClock(value) {
    this.setState({
      mouseInClock: value,
    });
  }

  get showMenu() {
    return this.state.showMenu;
  }

  set showMenu(value) {
    this.setState({
      showMenu: value,
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

  clockMouseOver() {
    this.mouseInClock = true;
  }

  clockMouseOut() {
    this.mouseInClock = false;
  }

  /******************************************************************************/

  renderClock() {
    const showed = this.showClock;
    const style = showed
      ? this.styles.classNames.clockLarge
      : this.styles.classNames.clockMiniature;

    return (
      <div className={style} onClick={this.toggleClock}>
        <AnalogClock
          size={this.context.theme.look.clockParams.size}
          limit={this.showClock ? 1 : 3}
          look={this.clockLook}
          mouseOver={this.clockMouseOver}
          mouseOut={this.clockMouseOut}
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
        <div className={this.styles.classNames.sajexRetro} />
        <Button
          kind="round"
          width="36px"
          height="36px"
          glyph={this.showClock ? 'solid/ellipsis-h' : null}
          onClick={
            this.showClock ? () => (this.showMenu = true) : this.toggleClock
          }
        />
      </RetroPanel>
    );
  }

  renderButtonModern() {
    if (this.showClock) {
      return (
        <React.Fragment>
          <div
            className={this.styles.classNames.simpleButton}
            onClick={this.toggleClock}
          >
            <FontAwesomeIcon icon={['fas', 'eye-slash']} />
          </div>
          <div
            className={this.styles.classNames.simpleButton}
            onClick={() => (this.showMenu = true)}
          >
            <FontAwesomeIcon icon={['fas', 'ellipsis-h']} />
          </div>
        </React.Fragment>
      );
    } else {
      return (
        <div
          className={
            this.mouseInClock && !this.showClock
              ? this.styles.classNames.doubleButtonHover
              : this.styles.classNames.doubleButton
          }
          onClick={this.toggleClock}
        ></div>
      );
    }
  }

  renderButton() {
    if (this.context.theme.look.name === 'retro') {
      return this.renderButtonRetro();
    } else {
      return this.renderButtonModern();
    }
  }

  renderMenu() {
    if (!this.showMenu) {
      return null;
    }

    return (
      <DesktopClockMenu
        right="0px"
        bottom={this.context.theme.shapes.footerHeight}
        looks={this.context.theme.look.clockParams.looks}
        clockSize={this.context.theme.look.clockParams.size}
        selected={this.clockLook}
        onSelect={(look) => {
          this.showMenu = false;
          this.clockLook = look;
        }}
        onClose={() => (this.showMenu = false)}
      />
    );
  }

  render() {
    if (this.context.theme.look.clock !== 'analog-clock') {
      return null;
    }

    return (
      <div className={this.styles.classNames.desktopClock}>
        {this.renderButton()}
        {this.renderClock()}
        {this.renderMenu()}
      </div>
    );
  }
}

/******************************************************************************/
