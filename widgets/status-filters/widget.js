import React from 'react';
import Widget from 'goblin-laboratory/widgets/widget';
import Label from 'goblin-gadgets/widgets/label/widget';
import FacetFilter from 'goblin-desktop/widgets/facet-filter/widget';
import * as styles from './styles';

/******************************************************************************/

class StatusFilter extends Widget {
  constructor() {
    super(...arguments);
    this.styles = styles;
    this.addFacet = this.addFacet.bind(this);
  }

  static get wiring() {
    return {
      id: 'id',
      facets: 'facets',
    };
  }

  addFacet() {
    // TODO
  }

  /******************************************************************************/

  renderAdd() {
    return (
      <div
        className={this.styles.classNames.statusFilterAddButton}
        onClick={this.addFacet}
      >
        <Label glyph="solid/plus" />
      </div>
    );
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
        {this.renderAdd()}
      </React.Fragment>
    );
  }
}

/******************************************************************************/

export default Widget.Wired(StatusFilter)();
