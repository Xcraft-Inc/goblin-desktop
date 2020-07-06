import React from 'react';
import Widget from 'goblin-laboratory/widgets/widget';
const T = require('goblin-nabu');
import * as styles from './styles';
import Button from 'goblin-gadgets/widgets/button/widget';
import Label from 'goblin-gadgets/widgets/label/widget';
import Slider from 'goblin-gadgets/widgets/slider/widget';

/******************************************************************************/

class DesktopScale extends Widget {
  constructor() {
    super(...arguments);
    this.styles = styles;

    this.onToggleDialog = this.onToggleDialog.bind(this);

    this.state = {
      showDialog: false,
    };

    this.min = 0.7;
    this.max = 2;
  }

  //#region get/set
  get showDialog() {
    return this.state.showDialog;
  }
  set showDialog(value) {
    this.setState({
      showDialog: value,
    });
  }
  //#endregion

  onToggleDialog() {
    this.showDialog = !this.showDialog;
  }

  valueToSlider(value) {
    const s = this.min;
    const d = this.max - this.min;
    return ((value - s) / d) * 100;
  }

  sliderToValue(value) {
    const s = this.min;
    const d = this.max - this.min;
    const n = s + (value / 100) * d;
    return Math.floor(n * 10) / 10;
  }

  /******************************************************************************/

  renderDialog() {
    if (!this.showDialog) {
      return null;
    }

    const style = {
      top: `${10 / this.props.zoom}px`,
      right: `${10 / this.props.zoom}px`,
      transform: `scale(${1 / this.props.zoom})`,
    };

    const z = `Zoom = ${this.props.zoom}`;

    return (
      <div className={this.styles.classNames.dialog} style={style}>
        <Label width="100px" text={z} />
        <Button
          shape="rounded"
          glyph="solid/minus"
          tooltip={T('Diminue le zoom')}
          disabled={this.props.zoom <= this.min}
          onClick={() => {
            this.doFor(this.context.labId, 'un-zoom');
          }}
        />
        <Label width="10px" />
        <Slider
          width="150px"
          direction="horizontal"
          value={this.valueToSlider(this.props.zoom)}
          changeMode="throttled"
          throttleDelay={50}
          onChange={(value) =>
            this.doFor(this.context.labId, 'change-zoom', {
              zoom: this.sliderToValue(value),
            })
          }
        />
        <Label width="10px" />
        <Button
          shape="rounded"
          glyph="solid/plus"
          tooltip={T('Augmente le zoom')}
          disabled={this.props.zoom >= this.max}
          onClick={() => {
            this.doFor(this.context.labId, 'zoom');
          }}
        />
        <Label width="10px" />
        <Button
          shape="rounded"
          text="1"
          tooltip={T('Remet le zoom 100%')}
          disabled={this.props.zoom === 1}
          onClick={() => {
            this.doFor(this.context.labId, 'default-zoom');
          }}
        />
        <div className={this.styles.classNames.close}>
          <Button
            border="none"
            glyph="solid/times"
            onClick={this.onToggleDialog}
          />
        </div>
      </div>
    );
  }

  renderButton() {
    return (
      <Button
        glyph="solid/binoculars"
        kind="main-tab-right"
        tooltip={T('Choix du zoom')}
        onClick={this.onToggleDialog}
      />
    );
  }

  render() {
    if (!window.zoomable) {
      return null;
    }

    return (
      <div className={this.styles.classNames.desktopScale}>
        {this.renderButton()}
        {this.renderDialog()}
      </div>
    );
  }
}

/******************************************************************************/

export default Widget.connect((state) => {
  const userSession = Widget.getUserSession(state);
  const clientSessionId = userSession.get('id');
  const zoom = userSession.get('zoom') || 1;

  return {clientSessionId, zoom};
})(DesktopScale);
