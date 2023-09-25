//T:2019-02-27
import React from 'react';
import Widget from 'goblin-laboratory/widgets/widget';
import NabuToolbar from 'goblin-nabu/widgets/nabu-toolbar/widget';
import DesktopStateMonitor from 'goblin-desktop/widgets/desktop-state-monitor/widget';
import DesktopMonitors from 'goblin-desktop/widgets/desktop-monitors/widget';
import DesktopNotebook from 'goblin-desktop/widgets/desktop-notebook/widget';
import DesktopClock from 'goblin-desktop/widgets/desktop-clock/widget';
import Monitor from 'goblin-desktop/widgets/monitor/widget';
import WidgetDocCaller from 'goblin-desktop/widgets/widget-doc-caller/widget';
import {getToolbarId} from 'goblin-nabu/lib/helpers.js';
const NabuToolbarConnected = Widget.Wired(NabuToolbar);

/******************************************************************************/

export default class DesktopFooter extends Widget {
  constructor() {
    super(...arguments);
  }

  /******************************************************************************/

  render() {
    const footerClass = this.props.showFooter
      ? this.styles.classNames.footer
      : this.styles.classNames.footerHidden;

    return (
      <div className={footerClass}>
        <NabuToolbarConnected
          id={getToolbarId(this.props.id)}
          desktopId={this.props.id}
        />
        <Monitor id={this.props.id + '$monitor'} />
        <WidgetDocCaller
          desktopId={this.props.id}
          id={this.props.id + '$widget-doc-caller'}
        />
        <div className={this.styles.classNames.sajex} />
        <DesktopStateMonitor id={this.props.id} />
        <DesktopNotebook id={this.props.id} desktopId={this.props.id} />
        <DesktopMonitors
          id={`activity-monitor@${this.props.id}`}
          desktopId={this.props.id}
        />
        <DesktopClock />
      </div>
    );
  }
}

/******************************************************************************/
