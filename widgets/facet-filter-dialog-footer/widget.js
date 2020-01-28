import React from 'react';
import Widget from 'laboratory/widget';
import T from 't';
import Button from 'goblin-gadgets/widgets/button/widget';

/******************************************************************************/

class FacetFilterDialogFooter extends Widget {
  constructor() {
    super(...arguments);
    this.clearAllFacets = this.clearAllFacets.bind(this);
    this.setAllFacets = this.setAllFacets.bind(this);
    this.toggleAllFacets = this.toggleAllFacets.bind(this);
  }

  clearAllFacets() {
    this.doAs('list', 'clear-all-facets', {
      filterName: this.props.name,
    });
  }

  setAllFacets() {
    this.doAs('list', 'set-all-facets', {
      filterName: this.props.name,
    });
  }

  toggleAllFacets() {
    this.doAs('list', 'toggle-all-facets', {
      filterName: this.props.name,
    });
  }

  render() {
    let enableClearAll = this.props.flags
      .toArray()
      .some(flag => flag.get('checked'));
    let enableSetAll = this.props.flags
      .toArray()
      .some(flag => !flag.get('checked'));

    return (
      <div className={this.styles.classNames.footer}>
        {enableSetAll ? (
          <Button
            border="none"
            glyph={'solid/check-square'}
            text={T('Tout cocher')}
            onClick={this.setAllFacets}
          />
        ) : null}
        {enableClearAll ? (
          <Button
            border="none"
            glyph={'regular/square'}
            text={T('Tout décocher')}
            onClick={this.clearAllFacets}
          />
        ) : null}
        {enableClearAll && enableSetAll ? (
          <Button
            border="none"
            glyph={'solid/sync'}
            text={T('Tout inverser')}
            onClick={this.toggleAllFacets}
          />
        ) : null}
      </div>
    );
  }
}
export default Widget.connect((state, props) => {
  const flags = state.get(`backend.${props.id}.checkboxes.${props.name}`);
  return {flags};
})(FacetFilterDialogFooter);
/******************************************************************************/
