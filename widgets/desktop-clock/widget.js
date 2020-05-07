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

class DesktopClock extends Widget {
  constructor() {
    super(...arguments);
    this.styles = styles;

    this.toggleClock = this.toggleClock.bind(this);
    this.changeClockLook = this.changeClockLook.bind(this);
    this.clockMouseOver = this.clockMouseOver.bind(this);
    this.clockMouseOut = this.clockMouseOut.bind(this);

    this.state = {
      mouseInClock: false,
      showMenuSize: false,
      showMenuLook: false,
    };
  }

  //#region get/set
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

  //#region state in user session
  getClockState(key, def) {
    if (this.props.desktopClockState) {
      return this.props.desktopClockState.get(key, def);
    } else {
      return def;
    }
  }

  changeClockState(clockState) {
    const currentState = this.props.desktopClockState
      ? this.props.desktopClockState.toJS()
      : {};
    const newState = {...currentState, ...clockState};
    this.doFor(this.props.clientSessionId, 'set-desktop-clock', {
      theme: this.context.theme.name,
      state: newState,
    });
  }

  get showClock() {
    const def = this.context.theme.look.clockParams
      ? this.context.theme.look.clockParams.initialVisibility
      : false;
    return this.getClockState('show', def);
  }
  set showClock(value) {
    this.changeClockState({show: value});
  }

  get clockSize() {
    const def = this.context.theme.look.clockParams
      ? this.context.theme.look.clockParams.size
      : null;
    return this.getClockState('size', def);
  }
  set clockSize(value) {
    this.changeClockState({size: value});
  }

  get clockLook() {
    const def = this.context.theme.look.clockParams
      ? this.context.theme.look.clockParams.initialLook
      : null;
    return this.getClockState('look', def);
  }
  set clockLook(value) {
    const mode = ['ring', 'transparent', 'light', 'discreet'].includes(value)
      ? 'fix'
      : 'stealth';
    this.changeClockState({look: value, mode});
  }

  get clockMode() {
    return this.getClockState('mode', 'stealth');
  }
  set clockMode(value) {
    this.changeClockState({mode: value});
  }

  get clockDigital() {
    return this.getClockState('digital', false);
  }
  set clockDigital(value) {
    this.changeClockState({digital: value});
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
        digital={this.clockDigital}
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
          glyph={this.showClock ? 'regular/clock' : null}
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
            <FontAwesomeIcon icon={['fas', 'ellipsis-v']} />
          </div>
          <div
            className={this.styles.classNames.simpleButton}
            onClick={() => (this.showMenuLook = true)}
          >
            <FontAwesomeIcon icon={['far', 'clock']} />
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
        glyph:
          this.clockMode === 'fix' ? 'regular/dot-circle' : 'regular/circle',
        text: T('Mode fixe'),
        action: () => {
          this.showMenuSize = false;
          this.clockMode = 'fix';
        },
      },
      {
        separator: true,
        kind: 'menu-line',
      },
      {
        glyph: this.clockDigital ? 'solid/check' : 'solid/times',
        text: T('Digital'),
        action: () => {
          this.showMenuSize = false;
          this.clockDigital = !this.clockDigital;
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

export default Widget.connect((state) => {
  const userSession = Widget.getUserSession(state);
  const clientSessionId = userSession.get('id');
  const theme = userSession.get('theme') || 'default';
  const desktopClockState = userSession.get(`desktopClock.${theme}`);

  return {clientSessionId, desktopClockState};
})(DesktopClock);
