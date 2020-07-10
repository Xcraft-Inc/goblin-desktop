import React from 'react';
import Widget from 'goblin-laboratory/widgets/widget';
import * as styles from './styles';
import Button from 'goblin-gadgets/widgets/button/widget';
import Label from 'goblin-gadgets/widgets/label/widget';
import Slider from 'goblin-gadgets/widgets/slider/widget';
import {percent as PercentConverters} from 'xcraft-core-converters';
import T from 't';

/******************************************************************************/

function getDisplayed(value) {
  return PercentConverters.getDisplayed(value);
}

/******************************************************************************/

class DesktopScale extends Widget {
  constructor() {
    super(...arguments);
    this.styles = styles;

    this.onToggleDialog = this.onToggleDialog.bind(this);

    this.state = {
      showDialog: false,
      zoom: this.props.zoom,
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

  get zoom() {
    return this.state.zoom;
  }
  set zoom(value) {
    this.setState({
      zoom: value,
    });
  }
  //#endregion

  onToggleDialog() {
    this.showDialog = !this.showDialog;
  }

  changeZoom(zoom) {
    zoom = Math.round(zoom * 10) / 10;
    this.doFor(this.context.labId, 'change-zoom', {zoom});
    this.zoom = zoom;
  }

  /******************************************************************************/

  renderDialog() {
    if (!this.showDialog) {
      return null;
    }

    const style = {
      top: `${10 / this.zoom}px`,
      right: `${10 / this.zoom}px`,
      transform: `scale(${1 / this.zoom})`,
    };

    // TODO: Use this mode for Slider!
    // changeMode="throttled"
    // throttleDelay={50}

    return (
      <div className={this.styles.classNames.dialog} style={style}>
        <Label width="50px" glyph="solid/binoculars" glyphSize="200%" />
        <Label width="70px" text={getDisplayed(this.zoom)} />
        <Button
          shape="rounded"
          glyph="solid/minus"
          tooltip={T('Diminue le zoom')}
          disabled={this.zoom <= this.min}
          onClick={() => this.changeZoom(this.zoom - 0.1)}
        />
        <Label width="10px" />
        <Slider
          width="150px"
          direction="horizontal"
          min={this.min}
          max={this.max}
          step={0.1}
          value={this.zoom}
          displayValue="dragging"
          getDisplayedValue={getDisplayed}
          changeMode="blur"
          onChange={(value) => this.changeZoom(value)}
        />
        <Label width="10px" />
        <Button
          shape="rounded"
          glyph="solid/plus"
          tooltip={T('Augmente le zoom')}
          disabled={this.zoom >= this.max}
          onClick={() => this.changeZoom(this.zoom + 0.1)}
        />
        <Label width="10px" />
        <Button
          shape="rounded"
          text="100%"
          fontSize="60%"
          tooltip={T('Remet le zoom 100%')}
          visibility={this.zoom !== 1}
          onClick={() => this.changeZoom(1)}
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