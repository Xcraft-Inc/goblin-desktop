import React from 'react';
import Widget from 'goblin-laboratory/widgets/widget';
import T from 't';
import Button from 'goblin-gadgets/widgets/button/widget';

/******************************************************************************/

class FacetFilterListDialogFooter extends Widget {
  constructor() {
    super(...arguments);
    this.clearAllFacets = this.clearAllFacets.bind(this);
    this.setAllFacets = this.setAllFacets.bind(this);
    this.toggleAllFacets = this.toggleAllFacets.bind(this);
    this.deleteFacet = this.deleteFacet.bind(this);
  }

  clearAllFacets() {
    this.doAs('list', 'clear-all-facets', {
      filterName: this.props.name,
      keys: this.props.keys.toArray(),
    });
  }

  setAllFacets() {
    this.doAs('list', 'set-all-facets', {
      filterName: this.props.name,
      keys: this.props.keys.toArray(),
    });
  }

  toggleAllFacets() {
    this.doAs('list', 'toggle-all-facets', {
      filterName: this.props.name,
      keys: this.props.keys.toArray(),
    });
  }

  deleteFacet() {
    // TODO
  }

  /******************************************************************************/

  render() {
    const filteredKeys = this.props.flags.filter((flag, key) =>
      this.props.keys.includes(key)
    );

    const enableClearAll = filteredKeys
      .valueSeq()
      .toArray()
      .some((flag) => flag.get('checked'));

    const enableSetAll = filteredKeys
      .valueSeq()
      .toArray()
      .some((flag) => !flag.get('checked'));

    return (
      <div className={this.styles.classNames.footer}>
        <Button
          active={!enableSetAll}
          border="none"
          glyph={'solid/check-square'}
          text={T('Tout cocher')}
          onClick={this.setAllFacets}
        />
        <Button
          active={!enableClearAll}
          border="none"
          glyph={'regular/square'}
          text={T('Tout décocher')}
          onClick={this.clearAllFacets}
        />
        {enableClearAll && enableSetAll ? (
          <Button
            border="none"
            glyph={'solid/sync'}
            text={T('Tout inverser')}
            onClick={this.toggleAllFacets}
          />
        ) : null}
        <div className={this.styles.classNames.sajex} />
        {this.props.prototypeMode ? (
          <Button
            border="none"
            glyph="solid/trash"
            tooltip={T('Supprime le filtre')}
            onClick={this.deleteFacet}
          />
        ) : null}
      </div>
    );
  }
}

/******************************************************************************/

export default Widget.connect((state, props) => {
  const flags = state.get(`backend.${props.id}.checkboxes.${props.name}`);
  const userSession = Widget.getUserSession(state);
  const prototypeMode = userSession.get('prototypeMode');

  return {flags, prototypeMode};
})(FacetFilterListDialogFooter);
