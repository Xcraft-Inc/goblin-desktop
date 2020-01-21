import React from 'react';
import Widget from 'laboratory/widget';
import Gauge from 'gadgets/gauge/widget';
import T from 'nabu/t/widget';

export default class FacetFilterButton extends Widget {
  constructor() {
    super(...arguments);
  }

  render() {
    let range = null;
    if (this.props.count !== this.props.total) {
      range = this.props.count;
    }

    const value = (this.props.count * 100) / this.props.total;

    return (
      <div
        className={this.styles.classNames.facetFilterButton}
        onClick={this.props.onClick}
      >
        <T msgid={this.props.text} className={this.styles.classNames.text} />
        <T msgid={range} className={this.styles.classNames.range} />
        <Gauge
          kind="rounded"
          gradient="red-yellow-green"
          direction="horizontal"
          height="12px"
          width="50px"
          value={value}
        />
      </div>
    );
  }
}
