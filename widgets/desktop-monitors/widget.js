import React from 'react';
import Widget from 'goblin-laboratory/widgets/widget';
const T = require('goblin-nabu');
import * as styles from './styles';
import Button from 'goblin-gadgets/widgets/button/widget';
import Checkbox from 'goblin-gadgets/widgets/checkbox/widget';
import SamplesMonitor from 'goblin-gadgets/widgets/samples-monitor/widget';
import RetroPanel from 'goblin-gadgets/widgets/retro-panel/widget';
import RetroIlluminatedButton from 'goblin-gadgets/widgets/retro-illuminated-button/widget';
import {ColorManipulator} from 'goblin-theme';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {Unit} from 'goblin-theme';
const px = Unit.toPx;

/******************************************************************************/

class DesktopMonitors extends Widget {
  constructor() {
    super(...arguments);
    this.styles = styles;

    this.onMonitor = this.onMonitor.bind(this);
    this.onChangeAging = this.onChangeAging.bind(this);

    this.state = {
      showMonitor: false,
      monitorSize: {width: 600, height: 450},
      monitorAging: 'old',
      doRenderMonitor: false,
    };

    this.handleTransitionEnd = this.handleTransitionEnd.bind(this);
    this.onDragDown = this.onDragDown.bind(this);
    this.onDragMove = this.onDragMove.bind(this);
    this.onDragUp = this.onDragUp.bind(this);
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

  get monitorSize() {
    return this.state.monitorSize;
  }
  set monitorSize(value) {
    this.setState({
      monitorSize: value,
    });
  }

  get monitorAging() {
    return this.state.monitorAging;
  }
  set monitorAging(value) {
    this.setState({
      monitorAging: value,
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
    this.doFor(this.props.desktopId, 'toggle-monitor-feed', {
      isOn: this.showMonitor,
    });
  }

  onChangeAging(aging) {
    this.monitorAging = aging;
  }

  onDragDown(e) {
    e.target.setPointerCapture(e.pointerId);

    this.isDragging = true;
    this.initialPositionX = e.clientX;
    this.initialPositionY = e.clientY;
    this.initialWidth = this.monitorSize.width;
    this.initialHeight = this.monitorSize.height;
  }

  onDragMove(e) {
    if (this.isDragging) {
      const deltaX = this.initialPositionX - e.clientX;
      const deltaY = this.initialPositionY - e.clientY;
      const width = Math.max(this.initialWidth + deltaX, 400);
      const height = Math.max(this.initialHeight + deltaY, 300);
      this.monitorSize = {width, height};
    }
  }

  onDragUp(e) {
    this.isDragging = false;
    e.target.releasePointerCapture(e.pointerId);
  }

  /******************************************************************************/

  renderResizeButton() {
    if (!this.showMonitor) {
      return null;
    }

    return (
      <div
        className={this.styles.classNames.monitorResizeButton}
        onPointerDown={this.onDragDown}
        onPointerMove={this.onDragMove}
        onPointerUp={this.onDragUp}
      >
        <div
          className={`glyph-hover ${this.styles.classNames.monitorResizeGlyph}`}
        >
          <FontAwesomeIcon icon={[`fas`, 'arrows-alt']} />
        </div>
      </div>
    );
  }

  renderMonitor() {
    const showed = this.showMonitor;
    const styleName = showed
      ? this.styles.classNames.monitorShowed
      : this.styles.classNames.monitorHidden;

    const style = {};
    if (!showed) {
      style.bottom = px(-this.monitorSize.height / 0.9);
    }

    const channels = Array.from(this.props.channels.entries()).map(
      ([channel, data]) => {
        return {
          name: channel,
          samples: data.get('samples'),
          max: data.get('delayedMax'),
        };
      }
    );

    return (
      <div
        className={styleName}
        style={style}
        onTransitionEnd={this.handleTransitionEnd}
      >
        <SamplesMonitor
          id={this.props.id}
          showed={showed}
          channels={channels}
          width={px(this.monitorSize.width)}
          height={px(this.monitorSize.height)}
          aging={this.monitorAging}
          onOff={this.onMonitor}
          onChangeAging={this.onChangeAging}
        />
        {this.renderResizeButton()}
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
        </RetroPanel>
      );
    } else {
      let glyph = 'light/square';
      let glyphColor = this.context.theme.palette.buttonDisableText;
      if (this.props.isActive) {
        glyph = 'solid/square';
        glyphColor = '#0f0';
      }

      return (
        <>
          <Button
            kind="button-footer"
            width="140px"
            justify="start"
            glyph={glyph}
            glyphColor={glyphColor}
            text={T('Activité')}
            onClick={this.onMonitor}
          />
        </>
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
const emptyChannels = [];

export default Widget.connect((state) => {
  const enabled = !!state.get('backend.activity-monitor');
  const isActive = !!state.get('backend.activity-monitor-led.isActive');

  if (!enabled) {
    return {isActive, channels: emptyChannels};
  }

  const channels = state.get('backend.activity-monitor.channels');
  return {
    isActive,
    channels,
  };
})(DesktopMonitors);
