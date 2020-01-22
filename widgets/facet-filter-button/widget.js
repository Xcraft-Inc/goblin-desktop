import React from 'react';
import Widget from 'laboratory/widget';
import Gauge from 'gadgets/gauge/widget';
import T from 'nabu/t/widget';

/******************************************************************************/

export default class FacetFilterButton extends Widget {
  constructor() {
    super(...arguments);
  }

  get full() {
    return this.props.count === this.props.total;
  }

  /******************************************************************************/

  renderText() {
    return (
      <T msgid={this.props.text} className={this.styles.classNames.text} />
    );
  }

  renderCount() {
    if (this.full) {
      return null;
    }

    return (
      <T msgid={this.props.count} className={this.styles.classNames.range} />
    );
  }

  renderGauge() {
    if (this.full) {
      return null;
    }

    const value = (this.props.count * 100) / this.props.total;

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

  render() {
    return (
      <div
        className={this.styles.classNames.facetFilterButton}
        onClick={this.props.onClick}
      >
        {this.renderText()}
        {this.renderCount()}
        {this.renderGauge()}
      </div>
    );
  }
}

/******************************************************************************/
