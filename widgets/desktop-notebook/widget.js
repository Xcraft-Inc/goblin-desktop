import React from 'react';
import Widget from 'goblin-laboratory/widgets/widget';
const T = require('goblin-nabu');
import * as styles from './styles';
import Button from 'goblin-gadgets/widgets/button/widget';
import Checkbox from 'goblin-gadgets/widgets/checkbox/widget';
import RetroPanel from 'goblin-gadgets/widgets/retro-panel/widget';
import {ColorManipulator} from 'goblin-theme';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {Unit} from 'goblin-theme';
const px = Unit.toPx;

class Editor extends Widget {
  render() {
    const contentStyle = {
      width: '100%',
      height: '100%',
      resize: 'none',
      paddingLeft: '20px',
      paddingTop: '50px',
      overflow: 'hidden',
      outline: 'none',
      caretColor: 'green',
    };
    return (
      <React.Fragment>
        <textarea
          autoFocus
          defaultValue={this.props.content}
          style={contentStyle}
          onChange={this.props.onChange}
        ></textarea>
      </React.Fragment>
    );
  }
}
/******************************************************************************/
class DesktopNotebook extends Widget {
  constructor() {
    super(...arguments);
    this.styles = styles;
    this.save = this.save.bind(this);
    this.onMonitor = this.onMonitor.bind(this);

    this.state = {
      showMonitor: false,
      monitorSize: {width: 600, height: 450},
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

  save(e) {
    this.doAs('desktop', 'save-note', {content: e.target.value});
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

    const boxStyle = {
      width: this.monitorSize.width,
      height: this.monitorSize.height,
      display: 'flex',
      flexDirection: 'row',
      borderTopLeftRadius: '20px',
      backgroundColor: '#333',
      overflow: 'hidden',
    };

    return (
      <div
        className={styleName}
        style={style}
        onTransitionEnd={this.handleTransitionEnd}
      >
        <div style={boxStyle}>
          <Editor content={this.props.note} onChange={this.save} />
        </div>

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
        </RetroPanel>
      );
    } else {
      let glyph = 'solid/pen';
      let glyphColor = this.context.theme.palette.buttonDisableText;

      return (
        <React.Fragment>
          <Button
            kind="button-footer"
            width="140px"
            justify="start"
            glyph={glyph}
            glyphColor={glyphColor}
            text={T('Notes')}
            onClick={this.onMonitor}
          />
        </React.Fragment>
      );
    }
  }

  render() {
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
  return {note: state.get(`backend.${props.id}.note`)};
})(DesktopNotebook);
