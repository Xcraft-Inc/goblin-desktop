import React from 'react';
import Widget from 'laboratory/widget';
import Gauge from 'gadgets/gauge/widget';
import Label from 'gadgets/label/widget';
import T from 't';
import TT from 'nabu/t/widget';

/******************************************************************************/

class FacetFilterButton extends Widget {
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
    for (const [key, flag] of this.props.flags.entries()) {
      if (flag.get('checked') === false) {
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
    if (this.props.loading) {
      return null;
    }

    let total = 0;
    let count = 0;
    for (const value of this.props.facets.values()) {
      const filter = value.get('key');
      const isChecked = this.props.flags._state.get(filter).get('checked');
      total = total + value.get('doc_count');
      if (isChecked) {
        count = count + value.get('doc_count');
      }
    }

    const disabled = this.props.numberOfCheckboxes <= 1;
    const style = disabled
      ? this.styles.classNames.facetFilterButtonDisabled
      : this.styles.classNames.facetFilterButton;

    return (
      <div className={style} onClick={this.props.onClick}>
        {this.renderTop(count, total)}
        {this.renderBottom(count, total)}
      </div>
    );
  }
}

/******************************************************************************/

export default Widget.connect((state, props) => {
  const flags = state.get(`backend.${props.id}.checkboxes.${props.name}`);
  if (flags) {
    return {flags, numberOfCheckboxes: flags.size};
  } else {
    return {loading: true};
  }
})(FacetFilterButton);
