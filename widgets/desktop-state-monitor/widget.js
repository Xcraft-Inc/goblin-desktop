import React from 'react';
import Widget from 'goblin-laboratory/widgets/widget';
const T = require('goblin-nabu');
import * as styles from './styles';
import Button from 'goblin-gadgets/widgets/button/widget';
import Checkbox from 'goblin-gadgets/widgets/checkbox/widget';
import DialogResizable from 'goblin-gadgets/widgets/dialog-resizable/widget';
import StateMonitor from 'goblin-gadgets/widgets/state-monitor/widget';
import RetroPanel from 'goblin-gadgets/widgets/retro-panel/widget';
import Frame from 'goblin-laboratory/widgets/frame/widget';
import {ColorManipulator} from 'goblin-theme';

/******************************************************************************/

class DesktopStateMonitor extends Widget {
  constructor() {
    super(...arguments);
    this.styles = styles;

    this.onToggleStateMonitor = this.onToggleStateMonitor.bind(this);
  }

  onToggleStateMonitor() {
    this.doAs('desktop', 'show-state-monitor', {show: !this.props.showed});
  }

  /******************************************************************************/

  renderStateMonitor() {
    if (!this.props.showed) {
      return null;
    }

    return (
      <Frame
        labId={this.context.labId}
        store={this.context.store}
        currentTheme="matrix"
        themeContext={this.props.themeContext}
      >
        <DialogResizable
          id="goblin-desktop/state-monitor"
          zIndex="20"
          titleBarText="Radar ― Backend State Monitor"
          minWidth="500px"
          minHeight="300px"
          width="1000px"
          height="600px"
          horizontal="0px"
          vertical="0px"
          drawChildrenWhileResizing={true}
          onCloseDialog={this.onToggleStateMonitor}
        >
          <StateMonitor
            id={this.props.id}
            onClose={this.onToggleStateMonitor}
          />
        </DialogResizable>
      </Frame>
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
            checked={this.props.showed}
            onChange={this.onToggleStateMonitor}
          />
        </RetroPanel>
      );
    } else {
      return (
        <Button
          kind="button-footer"
          width="120px"
          glyph="light/radar"
          glyphColor={this.props.showed ? '#0f0' : null}
          text={T('State')}
          onClick={this.onToggleStateMonitor}
        />
      );
    }
  }

  render() {
    return (
      <div className={this.styles.classNames.desktopState}>
        {this.renderButton()}
        {this.renderStateMonitor()}
      </div>
    );
  }
}

/******************************************************************************/

export default Widget.connect((state, props) => {
  const desktopState = state.get(`backend.${props.id}`);
  const themeContext = state.get(`backend.${window.labId}.themeContext`);

  return {
    showed: desktopState.get('showStateMonitor'),
    history: desktopState.get('stateMonitorHistory'),
    themeContext,
  };
})(DesktopStateMonitor);
