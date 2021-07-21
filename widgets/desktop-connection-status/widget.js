import React from 'react';
import Widget from 'goblin-laboratory/widgets/widget';
import * as styles from './styles';
import T from 't';
import Button from 'goblin-gadgets/widgets/button/widget';
import Label from 'goblin-gadgets/widgets/label/widget';
import Container from 'goblin-gadgets/widgets/container/widget';
import {ColorManipulator} from 'goblin-theme';

/******************************************************************************/

class DesktopConnectionStatusNC extends Widget {
  constructor() {
    super(...arguments);
    this.styles = styles;

    this.onToggleDialog = this.onToggleDialog.bind(this);
  }

  get showDialog() {
    return this.props.dialogVisibility;
  }

  set showDialog(value) {
    this.dispatchTo(this.widgetId, {
      type: value ? 'SHOW_DIALOG' : 'HIDE_DIALOG',
    });
  }

  onToggleDialog() {
    this.showDialog = !this.showDialog;
  }

  _getColor(lag) {
    const color = lag ? '#ff0000' : '#00ff00';
    return ColorManipulator.darken(color, 0.4);
  }

  renderRow(horde, lag, delta, noSocket) {
    return (
      <Container kind="row" key={horde}>
        <Label singleLine={true} text={T('{horde} :', '', {horde})} />
        <Label
          singleLine={true}
          kind="warning"
          text={
            noSocket
              ? T('inatteignable')
              : lag
              ? T('déconnecté depuis {delta}s', '', {
                  delta: parseInt(delta / 1000),
                })
              : T('connecté')
          }
        />
      </Container>
    );
  }

  renderDialog(hordes, color) {
    if (!this.showDialog) {
      return null;
    }
    return (
      <div className={this.styles.classNames.dialog}>
        <Label
          width="50px"
          glyph="solid/globe"
          glyphSize="150%"
          glyphColor={color}
        />
        <div className={this.styles.classNames.list}>
          <Label fontWeight="bold" text={T('Réseau')} bottomSpacing="large" />
          {hordes
            .entrySeq()
            .map(([horde, {lag, delta, noSocket}]) =>
              this.renderRow(horde, lag, delta, noSocket)
            )}
        </div>
      </div>
    );
  }

  renderStatus(hordes) {
    const lag = hordes
      .valueSeq()
      .toArray()
      .some(({lag}) => lag);
    const color = this._getColor(lag);

    return (
      <>
        <Button
          kind="main-tab-right"
          glyph="solid/globe"
          glyphColor={lag && color}
          tooltip={T('Statut du réseau')}
          onClick={() => this.onToggleDialog()}
          className={lag && this.styles.classNames.blink}
        />
        {this.renderDialog(hordes, color)}
      </>
    );
  }

  render() {
    const {hordes} = this.props;
    if (!hordes || hordes.isEmpty()) {
      return null;
    }

    return this.renderStatus(hordes);
  }
}

/******************************************************************************/

const DesktopConnectionStatus = Widget.connect((state, props) => {
  const stateWidgets = state.get('widgets').get(props.id);
  const stateNetwork = state.get('network');

  const hordes = stateNetwork.get('hordes');
  const dialogVisibility = stateWidgets
    ? stateWidgets.get('dialogVisibility')
    : false;
  return {hordes, dialogVisibility};
})(DesktopConnectionStatusNC);

export default DesktopConnectionStatus;
