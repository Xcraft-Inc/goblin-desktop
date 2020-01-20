import React from 'react';
import Widget from 'laboratory/widget';

export default class FacetFilterButton extends Widget {
  constructor() {
    super(...arguments);
  }

  render() {
    return (
      <div
        className={this.styles.classNames.facetFilterButton}
        onClick={this.props.onClick}
      >
        <div className={this.styles.classNames.text}>{this.props.text}</div>
        <div className={this.styles.classNames.range}>{this.props.range}</div>
      </div>
    );
  }
}
