//T:2019-02-27
import React from 'react';
import Widget from 'goblin-laboratory/widgets/widget';
import MouseTrap from 'mousetrap';
import NabuToolbar from 'goblin-nabu/widgets/nabu-toolbar/widget';
import DesktopMonitors from 'goblin-desktop/widgets/desktop-monitors/widget';
import Monitor from 'goblin-desktop/widgets/monitor/widget';
import WidgetDocCaller from 'goblin-desktop/widgets/widget-doc-caller/widget';
import IMG_GOBLIN from './goblin.png';
import {getToolbarId} from 'goblin-nabu/lib/helpers.js';
const NabuToolbarConnected = Widget.Wired(NabuToolbar)();

/******************************************************************************/

export default class DesktopFooter extends Widget {
  constructor() {
    super(...arguments);

    this.togglePrompt = this.togglePrompt.bind(this);
  }

  /******************************************************************************/

  togglePrompt(e) {
    if (e) {
      if (e.key === 'Enter') {
        this.dispatch({type: 'TOGGLEPROMPT'});
      }
    } else {
      this.dispatch({type: 'TOGGLEPROMPT'});
    }
  }

  connectCommandsPrompt() {
    MouseTrap.bind('ctrl+p', this.togglePrompt);
    return this.mapWidget(
      props => {
        return (
          <div
            style={{
              position: 'fixed',
              top: '50%',
              left: '50%',
              visibility: props.show ? 'visible' : 'hidden',
              backgroundColor: 'black',
            }}
          >
            <img src={IMG_GOBLIN} />
            {props.show ? (
              <input
                style={{
                  color: 'white',
                  fontWeight: 900,
                  fontSize: '1em',
                  background: 'transparent',
                  border: 'none',
                }}
                type="text"
                list="commands"
                autoFocus={true}
                onKeyPress={this.togglePrompt}
              />
            ) : null}
            <datalist id="commands" style={{zIndex: 100}}>
              {Object.keys(this.registry).map((cmd, index) => (
                <option key={index} value={cmd}>
                  {cmd}
                </option>
              ))}
            </datalist>
          </div>
        );
      },
      'show',
      `widgets.${this.props.id}.showPrompt`
    );
  }

  /******************************************************************************/

  render() {
    const CommandsPrompt = this.connectCommandsPrompt();
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
        <CommandsPrompt />
        <DesktopMonitors id={`activity-monitor@${this.props.id}`} />
      </div>
    );
  }
}

/******************************************************************************/
