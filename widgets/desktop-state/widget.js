import React from 'react';
import Widget from 'goblin-laboratory/widgets/widget';
const T = require('goblin-nabu');
import * as styles from './styles';
import Button from 'goblin-gadgets/widgets/button/widget';
import Checkbox from 'goblin-gadgets/widgets/checkbox/widget';
import StateMonitor from 'goblin-gadgets/widgets/state-monitor/widget';
import RetroPanel from 'goblin-gadgets/widgets/retro-panel/widget';
import {ColorManipulator} from 'electrum-theme';

/******************************************************************************/

class DesktopState extends Widget {
  constructor() {
    super(...arguments);
    this.styles = styles;

    this.onState = this.onState.bind(this);

    this.state = {
      showState: false,
      doRenderState: false,
    };

    this.handleTransitionEnd = this.handleTransitionEnd.bind(this);
  }

  //#region get/set
  get showState() {
    return this.state.showState;
  }
  set showState(value) {
    this.setState({
      showState: value,
    });
  }

  get doRenderState() {
    return this.state.doRenderState;
  }
  set doRenderState(value) {
    this.setState({
      doRenderState: value,
    });
  }
  //#endregion

  handleTransitionEnd(e) {
    if (e.propertyName === 'bottom') {
      const showed = !!this.showState;
      this.doRenderState = showed;
    }
  }

  onState() {
    this.showState = !this.showState;
  }

  /******************************************************************************/

  renderState() {
    const showed = this.showState;
    const style = showed
      ? this.styles.classNames.stateShowed
      : this.styles.classNames.stateHidden;

    return (
      <div className={style} onTransitionEnd={this.handleTransitionEnd}>
        <StateMonitor
          id={this.props.id}
          showed={showed}
          state={this.props.state}
          width="1000px"
          height="500px"
        />
      </div>
    );
  }

  renderButton() {
    if (this.context.theme.look.name === 'retro') {
      return (
        <RetroPanel
          position="relative"
          height="54px"
          kind="metal-plate"
          margin="3px"
          padding="0px 40px"
          radius="12px"
          flexDirection="row"
          justifyContent="center"
          alignItems="center"
          fillColor={ColorManipulator.darken(
            this.context.theme.palette.base,
            0.5
          )}
        >
          <Checkbox
            backgroundBrigtness="dark"
            checked={this.showState}
            onChange={this.onState}
          />
        </RetroPanel>
      );
    } else {
      return (
        <Button
          kind="button-footer"
          width="80px"
          text={T('State')}
          onClick={this.onState}
        />
      );
    }
  }

  render() {
    if (!this.props.state) {
      return null;
    }

    return (
      <div className={this.styles.classNames.desktopState}>
        {this.renderButton()}
        {this.renderState()}
      </div>
    );
  }
}

/******************************************************************************/

export default Widget.connect((state) => {
  const backendState = state.get('backend');
  return {
    state: backendState,
  };
})(DesktopState);
