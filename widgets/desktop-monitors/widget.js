import React from 'react';
import Widget from 'goblin-laboratory/widgets/widget';
import T from 't';
import * as styles from './styles';
import Button from 'goblin-gadgets/widgets/button/widget';
import SamplesMonitor from 'goblin-gadgets/widgets/samples-monitor/widget';

/******************************************************************************/

const ConnectedSamplesMonitor = Widget.connect((state, props) => {
  const channel = state.get(`backend.${props.id}.channels.${props.channel}`);
  return {
    samples: channel.get('samples').toArray(),
    current: channel.get('current'),
    total: channel.get('total'),
  };
})(SamplesMonitor);

/******************************************************************************/

class DesktopMonitors extends Widget {
  constructor() {
    super(...arguments);
    this.styles = styles;

    this.onMonitor = this.onMonitor.bind(this);

    this.state = {
      doRenderMonitor: false,
    };

    this.handleTransitionEnd = this.handleTransitionEnd.bind(this);
  }

  //#region get/set
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
      const showed = !!this.props.monitorShowed;
      this.doRenderMonitor = showed;
    }
  }

  onMonitor(channel) {
    channel = this.props.monitorShowed === channel ? null : channel;
    this.doFor(this.props.desktopId, 'monitor-showed', {channel});
  }

  /******************************************************************************/

  renderMonitor(channel, index) {
    const showed = true;
    return (
      <div
        key={index}
        className={this.styles.classNames.monitor}
        onTransitionEnd={this.handleTransitionEnd}
      >
        {showed || this.doRenderMonitor ? (
          <ConnectedSamplesMonitor
            id={this.props.id}
            channel={channel}
            showed={true}
            width="400px"
            height="300px"
          />
        ) : null}
      </div>
    );
  }

  renderMonitors() {
    const result = [];
    let index = 0;
    for (const channel of Object.keys(this.props.channels)) {
      result.push(this.renderMonitor(channel, index++));
    }
    return result;
  }

  renderButton(channel, hasActivity, index) {
    let glyph = 'light/square';
    let glyphColor = this.context.theme.palette.buttonDisableText;
    if (hasActivity) {
      glyphColor = '#0f0';
    }
    if (this.props.monitorShowed === channel) {
      glyph = 'solid/square';
    }

    return (
      <Button
        key={index}
        kind="button-footer"
        width="140px"
        justify="start"
        glyph={glyph}
        glyphColor={glyphColor}
        text={channel}
        onClick={() => this.onMonitor(channel)}
      />
    );
  }

  renderButtons() {
    const result = [];
    let index = 0;
    for (const [channel, hasActivity] of Object.entries(this.props.channels)) {
      result.push(this.renderButton(channel, hasActivity, index++));
    }
    return result;
  }

  render() {
    if (!Object.keys(this.props.channels).length === 0) {
      return null;
    }

    return (
      <div className={this.styles.classNames.desktopMonitors}>
        {this.renderButtons()}
        {this.renderMonitors()}
      </div>
    );
  }
}

/******************************************************************************/

const ConnectedDesktopMonitors = Widget.connect((state, props) => {
  const monitorShowed = state.get(`backend.${props.desktopId}.monitorShowed`);
  const channels = Array.from(
    state.get(`backend.${props.id}.channels`).entries()
  ).reduce((state, [name, data]) => {
    const samples = data.get('samples');
    state[name] = samples.last() > 0;
    return state;
  }, {});

  return {
    monitorShowed,
    channels,
  };
})(DesktopMonitors);

export default class extends Widget {
  render() {
    return (
      <ConnectedDesktopMonitors labId={this.context.labId} {...this.props} />
    );
  }
}
