import React from 'react';
import Widget from 'laboratory/widget';
import Label from 'gadgets/label/widget';
import StateBrowserDialog from 'goblin-gadgets/widgets/state-browser-dialog/widget';
import T from 't';
import C from 'goblin-laboratory/widgets/connect-helpers/c';

/******************************************************************************/

export default class FacetFilterAdd extends Widget {
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
        filter={['markdown']}
        state={state}
        acceptGlyph="solid/plus"
        acceptText={T('Ajouter')}
        onAccept={this.onAdd}
        onClose={this.onToggleShowDialog}
      />
    );
  }

  renderButton() {
    return (
      <div
        className={this.styles.classNames.facetFilterAddButton}
        onClick={this.onToggleShowDialog}
      >
        <Label glyph="solid/plus" />
      </div>
    );
  }

  render() {
    return (
      <div ref={node => (this.buttonNode = node)}>
        {this.renderButton()}
        {this.renderDialog()}
      </div>
    );
  }
}

/******************************************************************************/
