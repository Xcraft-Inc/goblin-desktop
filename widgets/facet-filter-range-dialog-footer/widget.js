import React from 'react';
import Widget from 'goblin-laboratory/widgets/widget';
import T from 't';
import Button from 'goblin-gadgets/widgets/button/widget';
import {date as DateConverters} from 'xcraft-core-converters';

/******************************************************************************/

class FacetFilterRangeDialogFooter extends Widget {
  constructor() {
    super(...arguments);
    this.setAll = this.setAll.bind(this);
    this.setNow = this.setNow.bind(this);
    this.setMonth = this.setMonth.bind(this);
    this.setPrev = this.setPrev.bind(this);
    this.setNext = this.setNext.bind(this);
    this.deleteFacet = this.deleteFacet.bind(this);
  }

  setAll() {
    this.props.setFilter(this.props.min, this.props.max);
  }

  setNow() {
    const now = DateConverters.getNowCanonical();
    this.props.setFilter(now, now);
  }

  setMonth() {
    const now = DateConverters.getNowCanonical();
    const from = DateConverters.moveAtBeginningOfMonth(now);
    const to = DateConverters.moveAtEndingOfMonth(now);
    this.props.setFilter(from, to);
  }

  setPrev() {
    let from, to;
    if (this.props.type === 'date') {
      const result = DateConverters.changePeriod(
        this.props.from,
        this.props.to,
        -1
      );
      from = result.fromDate;
      to = result.toDate;
    } else {
      const n = this.props.to - this.props.from;
      to = this.props.from - 1;
      from = to - n;
    }
    this.props.setFilter(from, to);
  }

  setNext() {
    let from, to;
    if (this.props.type === 'date') {
      const result = DateConverters.changePeriod(
        this.props.from,
        this.props.to,
        1
      );
      from = result.fromDate;
      to = result.toDate;
    } else {
      const n = this.props.to - this.props.from;
      from = this.props.to + 1;
      from = from + n;
    }
    this.props.setFilter(from, to);
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

    const monthFrom = DateConverters.moveAtBeginningOfMonth(now);
    const monthTo = DateConverters.moveAtEndingOfMonth(now);
    const enableMonth =
      this.props.type === 'date' &&
      (this.props.from !== monthFrom || this.props.to !== monthTo);

    const enablePrev = this.props.from > this.props.min;
    const enableNext = this.props.to < this.props.max;

    return (
      <div className={this.styles.classNames.footer}>
        {this.props.useRange ? (
          <Button
            active={!enableAll}
            border="none"
            text={T('Max')}
            tooltip={T('Montre un maximum de données')}
            onClick={this.setAll}
          />
        ) : null}
        {this.props.useRange && this.props.type === 'date' ? (
          <Button
            active={!enableNow}
            border="none"
            text={T("Aujourd'hui")}
            tooltip={T("Montre aujourd'hui")}
            onClick={this.setNow}
          />
        ) : null}
        {this.props.useRange && this.props.type === 'date' ? (
          <Button
            active={!enableMonth}
            border="none"
            text={T('Ce mois')}
            tooltip={T('Montre le mois en cours')}
            onClick={this.setMonth}
          />
        ) : null}
        {this.props.useRange ? (
          <Button
            disabled={!enablePrev}
            border="none"
            glyph="solid/chevron-left"
            tooltip={T('Données précédentes')}
            onClick={this.setPrev}
          />
        ) : null}
        {this.props.useRange ? (
          <Button
            disabled={!enableNext}
            border="none"
            glyph="solid/chevron-right"
            tooltip={T('Données suivantes')}
            onClick={this.setNext}
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
