import React from 'react';
import Widget from 'laboratory/widget';
import Label from 'gadgets/label/widget';
import FacetFilterAddDialog from 'goblin-desktop/widgets/facet-filter-add-dialog/widget';
import C from 'goblin-laboratory/widgets/connect-helpers/c';

/******************************************************************************/

export default class FacetFilterAdd extends Widget {
  constructor() {
    super(...arguments);

    this.state = {
      showDialog: false,
    };

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
      <FacetFilterAddDialog
        id={this.props.id}
        state={state}
        parentButtonRect={rect}
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
