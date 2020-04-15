import React from 'react';
import Widget from 'goblin-laboratory/widgets/widget';
import * as styles from './styles';
import Button from 'goblin-gadgets/widgets/button/widget';
import Checkbox from 'goblin-gadgets/widgets/checkbox/widget';
import Label from 'goblin-gadgets/widgets/label/widget';
import RetroPanel from 'goblin-gadgets/widgets/retro-panel/widget';
import Combo from 'goblin-gadgets/widgets/combo/widget';
import DesktopClockClock from 'goblin-desktop/widgets/desktop-clock-clock/widget';
import DesktopClockMenu from 'goblin-desktop/widgets/desktop-clock-menu/widget';
import {ColorManipulator} from 'electrum-theme';
import {Unit} from 'electrum-theme';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import T from 't';

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
      clockSize: this.context.theme.look.clockParams
        ? this.context.theme.look.clockParams.size
        : null,
      clockLook: this.context.theme.look.clockParams
        ? this.context.theme.look.clockParams.initialLook
        : null,
      clockMode: 'stealth',
      mouseInClock: false,
      showMenuSize: false,
      showMenuLook: false,
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

  get clockSize() {
    return this.state.clockSize;
  }

  set clockSize(value) {
    this.setState({
      clockSize: value,
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

  get clockMode() {
    return this.state.clockMode;
  }

  set clockMode(value) {
    this.setState({
      clockMode: value,
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

  get showMenuSize() {
    return this.state.showMenuSize;
  }

  set showMenuSize(value) {
    this.setState({
      showMenuSize: value,
    });
  }

  get showMenuLook() {
    return this.state.showMenuLook;
  }

  set showMenuLook(value) {
    this.setState({
      showMenuLook: value,
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

  getMenuSizeItem(text, factor) {
    const size = Unit.multiply(
      this.context.theme.look.clockParams.size,
      factor
    );
    return {
      text: text,
      active: this.clockSize === size,
      action: () => {
        this.showMenuSize = false;
        this.clockSize = size;
      },
    };
  }

  /******************************************************************************/

  renderClock() {
    return (
      <DesktopClockClock
        size={this.clockSize}
        look={this.clockLook}
        mode={this.clockMode}
        showClock={this.showClock}
        onClick={this.toggleClock}
        mouseOver={this.clockMouseOver}
        mouseOut={this.clockMouseOut}
      />
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
            this.showClock ? () => (this.showMenuLook = true) : this.toggleClock
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
            ref={(x) => (this.sizeButton = x)}
            className={this.styles.classNames.simpleButton}
            onClick={() => (this.showMenuSize = true)}
          >
            <FontAwesomeIcon icon={['fas', 'circle']} />
          </div>
          <div
            className={this.styles.classNames.simpleButton}
            onClick={() => (this.showMenuLook = true)}
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
              ? this.styles.classNames.tripleButtonHover
              : this.styles.classNames.tripleButton
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

  renderMenuSize() {
    if (!this.showMenuSize) {
      return null;
    }

    const list = [
      {
        glyph:
          this.clockMode === 'fix' ? 'regular/dot-circle' : 'regular/circle',
        text: T('Mode fixe'),
        action: () => {
          this.showMenuSize = false;
          this.clockMode = 'fix';
        },
      },
      {
        glyph:
          this.clockMode === 'stealth'
            ? 'regular/dot-circle'
            : 'regular/circle',
        text: T('Mode furtif'),
        action: () => {
          this.showMenuSize = false;
          this.clockMode = 'stealth';
        },
      },
      {
        separator: true,
        kind: 'menu-line',
      },
      this.getMenuSizeItem(T('Petite horloge'), 0.5),
      this.getMenuSizeItem(T('Horloge standard'), 1.0),
      this.getMenuSizeItem(T('Grande horloge'), 1.5),
      this.getMenuSizeItem(T('Immense horloge'), 2.0),
    ];

    const rect = this.sizeButton.getBoundingClientRect();
    const bottom = Unit.add(
      this.context.theme.shapes.footerHeight,
      this.context.theme.shapes.flyingBalloonTriangleSize
    );

    return (
      <Combo
        menuType="wrap"
        width="150px"
        left={(rect.left + rect.right) / 2}
        bottom={bottom}
        list={list}
        close={() => (this.showMenuSize = false)}
      />
    );
  }

  renderMenuLook() {
    if (!this.showMenuLook) {
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
          this.showMenuLook = false;
          this.clockLook = look;
          this.clockMode = ['ring', 'transparent', 'light'].includes(look)
            ? 'fix'
            : 'stealth';
        }}
        onClose={() => (this.showMenuLook = false)}
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
        {this.renderMenuSize()}
        {this.renderMenuLook()}
      </div>
    );
  }
}

/******************************************************************************/
