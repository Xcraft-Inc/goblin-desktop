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
      facets: 'facets',
    };
  }

  render() {
    const {id, facets} = this.props;
    if (!id || !facets) {
      return null;
    }

    return (
      <React.Fragment>
        {Array.from(facets.entries()).map(([k, v], i) => {
          return <FacetFilter id={this.props.id} key={i} name={k} facets={v} />;
        })}
      </React.Fragment>
    );
  }
}

export default Widget.Wired(StatusFilter)();
