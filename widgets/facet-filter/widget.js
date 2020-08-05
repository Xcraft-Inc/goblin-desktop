import React from 'react';
import Widget from 'laboratory/widget';
import FacetFilterDialog from 'goblin-desktop/widgets/facet-filter-dialog/widget';
import FacetFilterButton from 'goblin-desktop/widgets/facet-filter-button/widget';

/******************************************************************************/

export default class FacetFilter extends Widget {
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
      <FacetFilterDialog
        id={this.props.id}
        name={this.props.name}
        type={this.props.type}
        parentButtonRect={r}
        onClose={this.onToggleShowDialog}
      />
    );
  }

  render() {
    const {name, displayName, facets} = this.props;
    if (!facets) {
      return null;
    }

    return (
      <div ref={(node) => (this.buttonNode = node)}>
        <FacetFilterButton
          text={name}
          displayName={displayName}
          {...this.props}
          active={this.showDialog}
          onClick={this.onToggleShowDialog}
        />
        {this.renderDialog()}
      </div>
    );
  }
}

/******************************************************************************/
