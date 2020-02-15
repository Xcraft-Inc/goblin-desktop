//T:2019-02-27
import React from 'react';
import Widget from 'goblin-laboratory/widgets/widget';
import T from 't';
import * as styles from './styles';
import Button from 'goblin-gadgets/widgets/button/widget';

/******************************************************************************/

class DesktopMonitorsButtons extends Widget {
  constructor() {
    super(...arguments);
    this.styles = styles;

    this.onMonitor = this.onMonitor.bind(this);
    this.onMonitorPushSample = this.onMonitorPushSample.bind(this);
  }

  onMonitor(channel) {
    channel = this.props.monitorShowed === channel ? null : channel;
    this.doFor(this.props.id, 'monitor-showed', {channel});
  }

  onMonitorPushSample(channel, sample) {
    this.doFor(this.props.id, 'monitor-push-sample', {channel, sample});
  }

  /******************************************************************************/

  renderDebug() {
    return null;
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
    return (
      <React.Fragment>
        {this.renderDebug()}
        {this.renderButton('activity', T('Activity'))}
      </React.Fragment>
    );
  }
}

/******************************************************************************/

export default Widget.connect((state, props) => {
  const monitorShowed = state.get(`backend.${props.id}.monitorShowed`);
  const monitorsSamples = state.get(`backend.${props.id}.monitorsSamples`);
  return {
    monitorShowed,
    monitorsSamples,
  };
})(DesktopMonitorsButtons);
