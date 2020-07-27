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
    };
  }

  /******************************************************************************/

  render() {
    const {id, facets, facetsDisplayName} = this.props;
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
              displayName={facetsDisplayName.get(k)}
              facets={v}
            />
          );
        })}
        <FacetFilterAdd id={this.props.id} type={this.props.type} />
      </React.Fragment>
    );
  }
}

/******************************************************************************/

export default Widget.Wired(StatusFilter)();
