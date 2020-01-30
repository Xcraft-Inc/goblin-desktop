import React from 'react';
import Widget from 'laboratory/widget';
import Label from 'gadgets/label/widget';
import FacetFilterAddDialog from 'goblin-desktop/widgets/facet-filter-add-dialog/widget';

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

    const r = this.buttonNode.getBoundingClientRect();

    return (
      <FacetFilterAddDialog
        id={this.props.id}
        parentButtonRect={r}
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
