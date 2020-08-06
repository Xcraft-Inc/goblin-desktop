import React from 'react';
import Widget from 'laboratory/widget';
import T from 't';
import Button from 'goblin-gadgets/widgets/button/widget';
import {date as DateConverters} from 'xcraft-core-converters';

/******************************************************************************/

class FacetFilterRangeDialogFooter extends Widget {
  constructor() {
    super(...arguments);
    this.setAll = this.setAll.bind(this);
    this.setNow = this.setNow.bind(this);
    this.deleteFacet = this.deleteFacet.bind(this);
  }

  setAll() {
    this.doAs('list', 'set-range', {
      filterName: this.props.name,
      from: this.props.min,
      to: this.props.max,
    });
  }

  setNow() {
    const now = DateConverters.getNowCanonical();

    this.doAs('list', 'set-range', {
      filterName: this.props.name,
      from: now,
      to: now,
    });
  }

  deleteFacet() {
    // TODO
  }

  /******************************************************************************/

  render() {
    const enableAll =
      this.props.from !== this.props.min || this.props.to !== this.props.max;

    const now = DateConverters.getNowCanonical();
    const enableNow =
      this.props.type === 'date' &&
      (this.props.from !== now || this.props.to !== now);

    return (
      <div className={this.styles.classNames.footer}>
        {enableAll ? (
          <Button
            border="none"
            glyph="solid/arrows-h"
            text={T('Tout')}
            onClick={this.setAll}
          />
        ) : null}
        {enableNow ? (
          <Button
            border="none"
            glyph="solid/arrow-down"
            text={T("Aujourd'hui")}
            onClick={this.setNow}
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
  const userSession = Widget.getUserSession(state);
  const prototypeMode = userSession.get('prototypeMode');

  return {prototypeMode};
})(FacetFilterRangeDialogFooter);
