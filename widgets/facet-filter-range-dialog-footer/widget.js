import React from 'react';
import Widget from 'laboratory/widget';
import T from 't';
import Button from 'goblin-gadgets/widgets/button/widget';

/******************************************************************************/

class FacetFilterRangeDialogFooter extends Widget {
  constructor() {
    super(...arguments);
    this.setAll = this.setAll.bind(this);
    this.setNow = this.setNow.bind(this);
    this.deleteFacet = this.deleteFacet.bind(this);
  }

  setAll() {
    // TODO
    //? this.doAs('list', 'set-all-facets', {
    //?   filterName: this.props.name,
    //? });
  }

  setNow() {
    // TODO
    //? this.doAs('list', 'set-all-facets', {
    //?   filterName: this.props.name,
    //? });
  }

  deleteFacet() {
    // TODO
  }

  /******************************************************************************/

  render() {
    return (
      <div className={this.styles.classNames.footer}>
        <Button border="none" text={T('Tout')} onClick={this.setAll} />
        {this.props.type === 'date' ? (
          <Button border="none" text={T("Aujourd'hui")} onClick={this.setNow} />
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
  const userSession = Widget.getUserSession(state);
  const prototypeMode = userSession.get('prototypeMode');

  return {prototypeMode};
})(FacetFilterRangeDialogFooter);
