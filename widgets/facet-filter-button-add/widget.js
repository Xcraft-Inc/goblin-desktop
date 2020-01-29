import React from 'react';
import Widget from 'laboratory/widget';
import Label from 'gadgets/label/widget';

/******************************************************************************/

export default class FacetFilterButtonAdd extends Widget {
  constructor() {
    super(...arguments);
  }

  /******************************************************************************/

  render() {
    return (
      <div
        className={this.styles.classNames.facetFilterButtonAdd}
        onClick={this.props.onClick}
      >
        <Label glyph="solid/plus" />
      </div>
    );
  }
}

/******************************************************************************/
