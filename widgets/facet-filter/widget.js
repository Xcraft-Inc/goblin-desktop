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

  buildValueFlag() {
    return this.props.facets.reduce((state, facet) => {
      const value = facet.get('key');
      state[value] = {
        count: facet.get('doc_count'),
        checked: this.props.filter.get('value').contains(value),
      };
      return state;
    }, {});
  }

  onToggleShowDialog() {
    this.showDialog = !this.showDialog;
  }

  /******************************************************************************/

  renderDialog(flags) {
    if (!this.showDialog) {
      return null;
    }

    const r = this.buttonNode.getBoundingClientRect();

    return (
      <FacetFilterDialog
        {...this.props}
        flags={flags}
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

    const flags = this.buildValueFlag();

    return (
      <div ref={node => (this.buttonNode = node)}>
        <FacetFilterButton
          text={name}
          {...this.props}
          flags={flags}
          active={this.state.opened ? true : false}
          onClick={this.onToggleShowDialog}
        />
        {this.renderDialog(flags)}
      </div>
    );
  }
}

/******************************************************************************/
