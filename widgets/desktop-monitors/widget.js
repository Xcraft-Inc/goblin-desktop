import React from 'react';
import Widget from 'goblin-laboratory/widgets/widget';
import T from 't';
import * as styles from './styles';
import Button from 'goblin-gadgets/widgets/button/widget';
import SamplesMonitor from 'goblin-gadgets/widgets/samples-monitor/widget';
import samplesMonitors from './samples-monitors';

/******************************************************************************/

class DesktopMonitors extends Widget {
  constructor() {
    super(...arguments);
    this.styles = styles;

    this.onMonitor = this.onMonitor.bind(this);
    this.onMonitorPushSample = this.onMonitorPushSample.bind(this);

    this.state = {
      doRenderMonitor: false,
    };

    samplesMonitors.openChannel('activity', 100);
    this.timer = setInterval(() => this.update(), samplesMonitors.period);

    this.handleTransitionEnd = this.handleTransitionEnd.bind(this);
  }

  componentWillUnmount() {
    super.componentWillUnmount();
    clearInterval(this.timer);

    samplesMonitors.closeChannel('activity');
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

  update() {
    samplesMonitors.update('activity');

    if (this.props.monitorShowed) {
      this.forceUpdate();
    }
  }

  handleTransitionEnd(e) {
    if (e.propertyName === 'bottom') {
      const showed = !!this.props.monitorShowed;
      this.doRenderMonitor = showed;
    }
  }

  onMonitor(channel) {
    channel = this.props.monitorShowed === channel ? null : channel;
    this.doFor(this.props.id, 'monitor-showed', {channel});
  }

  onMonitorPushSample(channel, sample) {
    this.doFor(this.props.id, 'monitor-push-sample', {channel, sample});
  }

  /******************************************************************************/

  renderMonitor() {
    const monitorsSamples = this.props.monitorsSamples;
    for (const [channel, item] of monitorsSamples) {
      samplesMonitors.pushSample(channel, item.get('sample'));
    }

    const showed = !!this.props.monitorShowed;

    let current = null;
    let total = null;
    if (showed) {
      const item = this.props.monitorsSamples.get(this.props.monitorShowed);
      if (item) {
        current = item.get('current');
        total = item.get('total');
      }
    }

    return (
      <div
        className={this.styles.classNames.monitor}
        onTransitionEnd={this.handleTransitionEnd}
      >
        {showed || this.doRenderMonitor ? (
          <SamplesMonitor
            showed={showed}
            width="400px"
            height="300px"
            samples={samplesMonitors.getSamples(this.props.monitorShowed)}
            current={current}
            total={total}
          />
        ) : null}
      </div>
    );
  }

  renderDebug() {
    return (
      <React.Fragment>
        <Button
          border="none"
          text="R"
          onClick={() => this.onMonitorPushSample('activity', 0)}
        />
        <Button
          border="none"
          text="A"
          onClick={() =>
            this.onMonitorPushSample('activity', Math.random() * 100)
          }
          horizontalSpacing="large"
        />
      </React.Fragment>
    );
  }

  renderButton(channel, text) {
    let isActive = false;
    const monitorsSamples = this.props.monitorsSamples;
    if (monitorsSamples) {
      const item = monitorsSamples.get(channel);
      if (item) {
        isActive = item.get('sample') > 0;
      }
    }

    let glyph = 'light/square';
    let glyphColor = this.context.theme.palette.buttonDisableText;
    if (isActive) {
      glyphColor = '#0f0';
    }
    if (this.props.monitorShowed === channel) {
      glyph = 'solid/square';
    }

    return (
      <Button
        kind="button-footer"
        width="140px"
        justify="start"
        glyph={glyph}
        glyphColor={glyphColor}
        text={text}
        onClick={() => this.onMonitor(channel)}
      />
    );
  }

  render() {
    if (!this.props.monitorsSamples) {
      return null;
    }
    return (
      <div className={this.styles.classNames.desktopMonitors}>
        {this.renderButton('activity', T('Activity'))}
        {this.renderMonitor()}
      </div>
    );
  }
}

/******************************************************************************/

const ConnectedDesktopMonitors = Widget.connect((state, props) => {
  const monitorShowed = state.get(`backend.${props.id}.monitorShowed`);
  const monitorsSamples = state.get(`backend.${props.id}.monitorsSamples`);
  return {
    monitorShowed,
    monitorsSamples,
  };
})(DesktopMonitors);

export default class extends Widget {
  render() {
    return (
      <ConnectedDesktopMonitors labId={this.context.labId} {...this.props} />
    );
  }
}
