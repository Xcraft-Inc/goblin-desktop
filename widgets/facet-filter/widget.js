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
        {...this.props}
        parentButtonRect={r}
        onClose={this.onToggleShowDialog}
      />
    );
  }

  render() {
    const {name, filter, facets} = this.props;
    if (!filter || !facets) {
      return null;
    }

    let total = 0;
    let totalInList = 0;
    for (const value of this.props.facets.values()) {
      const filter = value.get('key');
      const isInList = this.props.filter.get('value').contains(filter);
      total = total + value.get('doc_count');
      if (!isInList) {
        totalInList = totalInList + value.get('doc_count');
      }
    }

    return (
      <div ref={node => (this.buttonNode = node)}>
        <FacetFilterButton
          text={name}
          count={totalInList}
          total={total}
          active={this.state.opened ? true : false}
          onClick={this.onToggleShowDialog}
        />
        {this.renderDialog()}
      </div>
    );
  }
}

/******************************************************************************/
