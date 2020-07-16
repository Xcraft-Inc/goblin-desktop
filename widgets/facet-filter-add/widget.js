import React from 'react';
import Widget from 'laboratory/widget';
import Label from 'gadgets/label/widget';
import StateBrowserDialog from 'goblin-gadgets/widgets/state-browser-dialog/widget';
import T from 't';
import C from 'goblin-laboratory/widgets/connect-helpers/c';

/******************************************************************************/

class FacetFilterAdd extends Widget {
  constructor() {
    super(...arguments);

    this.state = {
      showDialog: false,
    };

    this.onAdd = this.onAdd.bind(this);
    this.onToggleShowDialog = this.onToggleShowDialog.bind(this);
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

  onAdd(value) {
    this.showDialog = false;
    // TODO
  }

  onToggleShowDialog() {
    this.showDialog = !this.showDialog;
  }

  /******************************************************************************/

  renderDialog() {
    if (!this.showDialog) {
      return null;
    }

    const rect = this.buttonNode.getBoundingClientRect();

    const path = `backend.entity-schema@${this.props.type}`;
    const state = C(path);

    return (
      <StateBrowserDialog
        parentButtonRect={rect}
        title={T('Ajouter un nouveau filtre')}
        value=""
        // filter={['markdown']}
        state={state}
        acceptGlyph="solid/plus"
        acceptText={T('Ajouter')}
        onAccept={this.onAdd}
        onClose={this.onToggleShowDialog}
      />
    );
  }

  renderButton() {
    const style = this.showDialog
      ? this.styles.classNames.facetFilterAddButtonActive
      : this.styles.classNames.facetFilterAddButton;

    return (
      <div className={style} onClick={this.onToggleShowDialog}>
        <Label glyph="solid/plus" />
      </div>
    );
  }

  render() {
    if (!this.props.prototypeMode) {
      return null;
    }

    return (
      <div ref={(node) => (this.buttonNode = node)}>
        {this.renderButton()}
        {this.renderDialog()}
      </div>
    );
  }
}

/******************************************************************************/

const FacetFilterAddConnected = Widget.connect((state) => {
  const userSession = Widget.getUserSession(state);
  const prototypeMode = userSession.get('prototypeMode');

  return {prototypeMode};
})(FacetFilterAdd);

export default FacetFilterAddConnected;
