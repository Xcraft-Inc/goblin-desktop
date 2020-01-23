import React from 'react';
import Widget from 'laboratory/widget';
import Gauge from 'gadgets/gauge/widget';
import Label from 'gadgets/label/widget';
import T from 't';
import TT from 'nabu/t/widget';

/******************************************************************************/

export default class FacetFilterButton extends Widget {
  constructor() {
    super(...arguments);
  }

  isFull(count, total) {
    return count === total;
  }

  /******************************************************************************/

  renderText() {
    return (
      <TT msgid={this.props.text} className={this.styles.classNames.text} />
    );
  }

  renderCount(count, total) {
    let text;
    if (this.isFull(count, total)) {
      text = T('Tout');
    } else {
      text = count;
    }

    return <TT msgid={text} className={this.styles.classNames.count} />;
  }

  renderGauge(count, total) {
    if (this.isFull(count, total)) {
      return null;
    }

    const value = (count * 100) / total;

    return (
      <Gauge
        kind="rounded"
        gradient="red-yellow-green"
        direction="horizontal"
        height="12px"
        width="50px"
        value={value}
      />
    );
  }

  renderTop(count, total) {
    return (
      <div className={this.styles.classNames.top}>
        {this.renderText()}
        {this.renderCount(count, total)}
        {this.renderGauge(count, total)}
      </div>
    );
  }

  renderFilter(glyph, array) {
    return <Label fontSize="80%" glyph={glyph} text={array.join(', ')} />;
  }

  renderBottom(count, total) {
    if (this.isFull(count, total)) {
      return null;
    }

    const sets = [];
    const clears = [];
    for (const [key, flag] of Object.entries(this.props.flags)) {
      if (flag.checked) {
        clears.push(key);
      } else {
        sets.push(key);
      }
    }

    return (
      <div className={this.styles.classNames.bottom}>
        {sets.length <= clears.length
          ? this.renderFilter('solid/eye', sets)
          : this.renderFilter('solid/eye-slash', clears)}
      </div>
    );
  }

  render() {
    let total = 0;
    let count = 0;
    for (const value of this.props.facets.values()) {
      const filter = value.get('key');
      const isInList = this.props.filter.get('value').contains(filter);
      total = total + value.get('doc_count');
      if (!isInList) {
        count = count + value.get('doc_count');
      }
    }

    return (
      <div
        className={this.styles.classNames.facetFilterButton}
        onClick={this.props.onClick}
      >
        {this.renderTop(count, total)}
        {this.renderBottom(count, total)}
      </div>
    );
  }
}

/******************************************************************************/
