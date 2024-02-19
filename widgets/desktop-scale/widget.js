import React from 'react';
import Widget from 'goblin-laboratory/widgets/widget';
import * as styles from './styles';
import Button from 'goblin-gadgets/widgets/button/widget';
import Label from 'goblin-gadgets/widgets/label/widget';
import Slider from 'goblin-gadgets/widgets/slider/widget';
import {percent as PercentConverters} from 'xcraft-core-converters';
import T from 't';
import {Unit} from 'goblin-theme';
const to = Unit.to;

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

    this.min = 0.2;
    this.max = 2;
  }

  //#region get/set
  get showDialog() {
    return this.props.dialogVisibility;
  }

  set showDialog(value) {
    this.dispatchTo(this.widgetId, {
      type: value ? 'SHOW_DIALOG' : 'HIDE_DIALOG',
    });
  }
  //#endregion

  onToggleDialog() {
    this.showDialog = !this.showDialog;
  }

  changeZoom(zoom) {
    zoom = Math.round(zoom * 10) / 10;
    this.doFor(this.context.labId, 'change-zoom', {zoom});
  }

  /******************************************************************************/

  renderDialog() {
    if (!this.showDialog) {
      return null;
    }

    const {cssUnit} = this.props;

    return (
      <div className={this.styles.classNames.dialog}>
        <Label
          cssUnit={cssUnit}
          width={to(50, cssUnit)}
          glyph="solid/binoculars"
          glyphSize="200%"
        />
        <Label
          cssUnit={cssUnit}
          width={to(70, cssUnit)}
          text={getDisplayed(this.props.zoom)}
        />
        <Button
          cssUnit={cssUnit}
          width={to(32, cssUnit)}
          shape="rounded"
          glyph="solid/minus"
          tooltip={T('Diminue le zoom')}
          disabled={this.props.zoom <= this.min}
          onClick={() => this.changeZoom(this.props.zoom - 0.1)}
        />
        <Label cssUnit={cssUnit} width={to(10, cssUnit)} />
        <Slider
          cssUnit={cssUnit}
          width={to(150, cssUnit)}
          direction="horizontal"
          min={this.min}
          max={this.max}
          step={0.1}
          value={this.props.zoom}
          displayValue="dragging"
          getDisplayedValue={getDisplayed}
          changeMode="throttled"
          throttleDelay={50}
          onChange={(value) => this.changeZoom(value)}
        />
        <Label cssUnit={cssUnit} width={to(10, cssUnit)} />
        <Button
          cssUnit={cssUnit}
          width={to(32, cssUnit)}
          shape="rounded"
          glyph="solid/plus"
          tooltip={T('Augmente le zoom')}
          disabled={this.props.zoom >= this.max}
          onClick={() => this.changeZoom(this.props.zoom + 0.1)}
        />
        <Label cssUnit={cssUnit} width={to(10, cssUnit)} />
        <Button
          cssUnit={cssUnit}
          shape="rounded"
          text="100%"
          fontSize={to(10, cssUnit)}
          tooltip={T('Remet le zoom 100%')}
          disabled={this.props.zoom === 1}
          onClick={() => this.changeZoom(1)}
        />
        <div className={this.styles.classNames.close}>
          <Button
            cssUnit={cssUnit}
            border="none"
            glyph="solid/times"
            onClick={this.onToggleDialog}
          />
        </div>
      </div>
    );
  }

  renderButton({onClick}) {
    return (
      <Button
        glyph="solid/binoculars"
        kind="main-tab-right"
        tooltip={T('Choix du zoom')}
        onClick={onClick}
      />
    );
  }

  render() {
    if (!window.zoomable) {
      return null;
    }
    const renderButton = this.props.renderButton || this.renderButton;
    return (
      <div className={this.styles.classNames.desktopScale}>
        {renderButton({onClick: this.onToggleDialog})}
        {this.renderDialog()}
      </div>
    );
  }
}

/******************************************************************************/

export default Widget.connect((state, props) => {
  const stateWidgets = state.get('widgets').get(props.id);
  const userSession = Widget.getUserSession(state);

  const clientSessionId = userSession.get('id');
  const zoom = userSession.get('zoom') || 1;
  const dialogVisibility = stateWidgets
    ? stateWidgets.get('dialogVisibility')
    : false;
  return {
    clientSessionId,
    zoom,
    dialogVisibility,
    cssUnit: {unit: 'vmin', ratio: 0.1},
  };
})(DesktopScale);
