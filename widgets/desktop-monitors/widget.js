import React from 'react';
import Widget from 'goblin-laboratory/widgets/widget';
const T = require('goblin-nabu');
import * as styles from './styles';
import Button from 'goblin-gadgets/widgets/button/widget';
import Checkbox from 'goblin-gadgets/widgets/checkbox/widget';
import SamplesMonitor from 'goblin-gadgets/widgets/samples-monitor/widget';
import RetroPanel from 'goblin-gadgets/widgets/retro-panel/widget';
import RetroIlluminatedButton from 'goblin-gadgets/widgets/retro-illuminated-button/widget';
import {ColorManipulator} from 'electrum-theme';

/******************************************************************************/

class DesktopMonitors extends Widget {
  constructor() {
    super(...arguments);
    this.styles = styles;

    this.onMonitor = this.onMonitor.bind(this);

    this.state = {
      showMonitor: false,
      doRenderMonitor: false,
    };

    this.handleTransitionEnd = this.handleTransitionEnd.bind(this);
  }

  //#region get/set
  get showMonitor() {
    return this.state.showMonitor;
  }

  set showMonitor(value) {
    this.setState({
      showMonitor: value,
    });
  }

  get doRenderMonitor() {
    return this.state.doRenderMonitor;
  }

  set doRenderMonitor(value) {
    this.setState({
      doRenderMonitor: value,
    });
  }
  //#endregion

  handleTransitionEnd(e) {
    if (e.propertyName === 'bottom') {
      const showed = !!this.showMonitor;
      this.doRenderMonitor = showed;
    }
  }

  onMonitor() {
    this.showMonitor = !this.showMonitor;
  }

  /******************************************************************************/

  renderMonitor() {
    const showed = this.showMonitor;
    const style = showed
      ? this.styles.classNames.monitorShowed
      : this.styles.classNames.monitorHidden;

    return (
      <div className={style} onTransitionEnd={this.handleTransitionEnd}>
        <SamplesMonitor
          id={this.props.id}
          showed={showed}
          channels={this.props.channels}
          width="600px"
          height="450px"
          onOff={this.onMonitor}
        />
      </div>
    );
  }

  renderButton() {
    if (this.context.theme.look.name === 'retro') {
      return (
        <div className={this.styles.classNames.monitorPanel}>
          <RetroPanel
            top="0px"
            bottom="0px"
            left="0px"
            right="0px"
            kind="metal-plate"
            margin="3px"
            radius="12px"
            fillColor={ColorManipulator.darken(
              this.context.theme.palette.base,
              0.5
            )}
          >
            <div className={this.styles.classNames.monitorPanelContent}>
              <Checkbox
                backgroundBrigtness="dark"
                checked={this.showMonitor}
                onChange={this.onMonitor}
              />
              <div className={this.styles.classNames.monitorSajex} />
              <RetroIlluminatedButton
                glyph="solid/none"
                width="20px"
                height="20px"
                material="led"
                backgroundColor={this.props.isActive ? '#0f0' : '#888'}
                color="white"
                onClick={this.onMonitor}
              />
            </div>
          </RetroPanel>
        </div>
      );
    } else {
      let glyph = 'light/square';
      let glyphColor = this.context.theme.palette.buttonDisableText;
      if (this.props.isActive) {
        glyph = 'solid/square';
        glyphColor = '#0f0';
      }

      return (
        <Button
          kind="button-footer"
          width="140px"
          justify="start"
          glyph={glyph}
          glyphColor={glyphColor}
          text={T('Activité')}
          onClick={this.onMonitor}
        />
      );
    }
  }

  render() {
    if (!Object.keys(this.props.channels).length === 0) {
      return null;
    }

    return (
      <div className={this.styles.classNames.desktopMonitors}>
        {this.renderButton()}
        {this.renderMonitor()}
      </div>
    );
  }
}

/******************************************************************************/

export default Widget.connect((state, props) => {
  const s = state.get(`backend.${props.id}.channels`);
  const channels = s
    ? Array.from(s.entries()).map(([channel, data]) => {
        return {
          name: channel,
          samples: data.get('samples'),
          isActive: data.get('isActive'),
          max: data.get('delayedMax'),
        };
      })
    : [];

  let isActive = false;
  for (const channel of channels) {
    if (channel.isActive) {
      isActive = true;
      continue;
    }
  }

  return {
    isActive,
    channels,
  };
})(DesktopMonitors);
