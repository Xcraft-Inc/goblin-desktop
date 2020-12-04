import React from 'react';
import Widget from 'goblin-laboratory/widgets/widget';
const T = require('goblin-nabu');
import * as styles from './styles';
import Button from 'goblin-gadgets/widgets/button/widget';
import Label from 'goblin-gadgets/widgets/label/widget';
import Checkbox from 'goblin-gadgets/widgets/checkbox/widget';
import Slider from 'goblin-gadgets/widgets/slider/widget';
import SamplesMonitor from 'goblin-gadgets/widgets/samples-monitor/widget';
import RetroPanel from 'goblin-gadgets/widgets/retro-panel/widget';
import RetroIlluminatedButton from 'goblin-gadgets/widgets/retro-illuminated-button/widget';
import {ColorManipulator} from 'goblin-theme';
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
      monitorHeight: 450,
      monitorAging: 'old',
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

  get monitorHeight() {
    return this.state.monitorHeight;
  }
  set monitorHeight(value) {
    this.setState({
      monitorHeight: value,
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

  /******************************************************************************/

  renderMonitor() {
    const showed = this.showMonitor;
    const styleName = showed
      ? this.styles.classNames.monitorShowed
      : this.styles.classNames.monitorHidden;

    const style = {};
    if (!showed) {
      style.bottom = px(-this.monitorHeight / 0.9);
    }

    return (
      <div
        className={styleName}
        style={style}
        onTransitionEnd={this.handleTransitionEnd}
      >
        <SamplesMonitor
          id={this.props.id}
          showed={showed}
          channels={this.props.channels}
          width={px(this.monitorHeight / 0.75)}
          height={px(this.monitorHeight)}
          aging={this.monitorAging}
          onOff={this.onMonitor}
          onChangeAging={this.onChangeAging}
        />
      </div>
    );
  }

  renderSlider() {
    if (this.showMonitor) {
      return (
        <Slider
          direction="horizontal"
          cabSize="large"
          gliderSize="large"
          displayValue="never"
          barColor={this.context.theme.palette.chrome}
          width="120px"
          changeMode="throttled"
          throttleDelay={200}
          min={300}
          max={1200}
          value={this.monitorHeight}
          onChange={(h) => (this.monitorHeight = h)}
        />
      );
    } else {
      return <Label width="120px" />;
    }
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
          <div className={this.styles.classNames.monitorSajex} />
          {this.renderSlider()}
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
        <React.Fragment>
          <Button
            kind="button-footer"
            width="140px"
            justify="start"
            glyph={glyph}
            glyphColor={glyphColor}
            text={T('Activité')}
            onClick={this.onMonitor}
          />
          <div className={this.styles.classNames.monitorSlider}>
            {this.renderSlider()}
          </div>
        </React.Fragment>
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

export default Widget.connect((state) => {
  const enabled = !!state.get('backend.activity-monitor');
  const isActive = !!state.get('backend.activity-monitor-led.isActive');

  if (!enabled) {
    return {isActive, channels: []};
  }

  const s = state.get('backend.activity-monitor.channels');
  const channels = s
    ? Array.from(s.entries()).map(([channel, data]) => {
        return {
          name: channel,
          samples: data.get('samples'),
          max: data.get('delayedMax'),
        };
      })
    : [];

  return {
    isActive,
    channels,
  };
})(DesktopMonitors);
