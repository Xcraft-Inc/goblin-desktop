import React from 'react';
import Widget from 'goblin-laboratory/widgets/widget';
import FacetFilter from 'goblin-desktop/widgets/facet-filter/widget';
import FacetFilterAdd from 'goblin-desktop/widgets/facet-filter-add/widget';

/******************************************************************************/

class StatusFilter extends Widget {
  constructor() {
    super(...arguments);
  }

  static get wiring() {
    return {
      id: 'id',
      facets: 'facets',
      facetsDisplayName: 'facetsDisplayName',
      facetsMappingType: 'facetsMappingType',
    };
  }

  get sortedFacets() {
    const facets = [];

    const s = new Set();

    // First, put all the facets corresponding to columns, in the same order.
    for (const path of this.props.columnPaths) {
      if (path) {
        const items = this.props.facets.get(path);
        if (items) {
          s.add(path);
          facets.push({name: path, items: items});
        }
      }
    }

    // Finally, put the remaining facets.
    Array.from(this.props.facets.entries()).map(([k, v]) => {
      if (!s.has(k)) {
        facets.push({name: k, items: v});
      }
    });

    return facets;
  }

  /******************************************************************************/

  renderFacet(name, items, index) {
    return (
      <FacetFilter
        id={this.props.id}
        key={index}
        name={name}
        displayName={this.props.facetsDisplayName.get(name)}
        type={this.props.facetsMappingType.get(name)}
        facets={items}
      />
    );
  }

  renderFacets() {
    const result = [];

    const facets = this.sortedFacets;
    let index = 0;
    for (const facet of facets) {
      result.push(this.renderFacet(facet.name, facet.items, index++));
    }

    return result;
  }

  render() {
    if (!this.props.id || !this.props.facets) {
      return null;
    }

    return (
      <React.Fragment>
        {this.renderFacets()}
        <FacetFilterAdd id={this.props.id} type={this.props.type} />
      </React.Fragment>
    );
  }
}

/******************************************************************************/

const StatusFilterConnected = Widget.connect((state, props) => {
  const view = state.get(`backend.view@${props.type}`);
  if (!view) {
    return {};
  }

  let columnIds = view.get('columns');

  const clientSessionId = state.get(`backend.${window.labId}.clientSessionId`);
  const userView = state.get(
    `backend.${clientSessionId}.views.view@${props.type}`
  );
  if (userView) {
    const order = userView.get('order');
    if (order.size > 0) {
      //todo clean non available
      columnIds = order;
    }
  }

  const columnPaths = columnIds.map((columnId) => {
    const column = state.get(`backend.${columnId}`);
    return column ? column.get('path').replace(/\./g, '/') : null;
  });

  return {columnPaths};
})(StatusFilter);

export default Widget.Wired(StatusFilterConnected)();
