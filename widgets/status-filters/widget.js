import React from 'react';
import Widget from 'goblin-laboratory/widgets/widget';
import FacetFilter from 'goblin-desktop/widgets/facet-filter/widget';

class StatusFilter extends Widget {
  constructor() {
    super(...arguments);
  }

  static get wiring() {
    return {
      id: 'id',
      filters: 'options.filters',
      facets: 'facets',
    };
  }

  render() {
    const {id, facets, filters} = this.props;
    if (!id || !facets) {
      return null;
    }

    return (
      <React.Fragment>
        {Array.from(facets.entries()).map(([k, v], i) => {
          return (
            <FacetFilter
              id={this.props.id}
              key={i}
              name={k}
              facets={v}
              filter={filters.get(k)}
            />
          );
        })}
      </React.Fragment>
    );
  }
}

export default Widget.Wired(StatusFilter)();
