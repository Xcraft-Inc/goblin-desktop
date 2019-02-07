import React from 'react';
import Widget from 'laboratory/widget';
import ReactList from 'react-list';
import Container from 'gadgets/container/widget';
import throttle from 'lodash/throttle';
import DatagridItem from './datagrid-item';

class DatagridTable extends Widget {
  constructor() {
    super(...arguments);

    this.renderItem = this.renderItem.bind(this);
    this.estimateItemSize = this.estimateItemSize.bind(this);

    this._height = 40;
    this._threshold = 20;
    this._fetchInternal = this._fetchInternal.bind(this);
    this._fetch = throttle(this._fetchInternal, 200).bind(this);
    this._range = {};

    this.listRef = React.createRef();
  }

  _fetchInternal() {
    if (!this.listRef.current) {
      return;
    }

    const range = this.listRef.current
      ? this.listRef.current.getVisibleRange()
      : [0, 0];
    const {count} = this.props;

    /* Ensure to test against the right list id. Because the fetching is
     * executed by a setTimeout, it's possible that an other list will
     * be presented.
     */
    if (!this._range[this.props.id]) {
      this._range[this.props.id] = [];
    }

    if (
      range[0] >= this._range[this.props.id][0] - this._threshold / 2 &&
      range[1] <= this._range[this.props.id][1] + this._threshold / 2
    ) {
      return;
    }

    this._range[this.props.id] = range.slice();

    /* Add a margin of this._threshold entries (if possible) for the range */
    range[0] =
      range[0] >= this._threshold //
        ? range[0] - this._threshold
        : 0;
    range[1] =
      range[1] + this._threshold < count
        ? range[1] + this._threshold
        : count - 1;

    const service = `list@${this.props.id}`;
    this.doFor(service, 'fetch', {range});
  }

  renderItem(index) {
    setTimeout(this._fetch, 0);

    return (
      <DatagridItem
        index={index}
        id={this.props.listIds.get(index)}
        key={index}
        renderItem={this.props.renderItem}
      />
    );
  }

  estimateItemSize(index, cache) {
    if (cache[index]) {
      this._height = cache[index];
      return this._height;
    }
    this._height = cache[0] ? cache[0] : 40;
    return this._height;
  }

  render() {
    if (!this.props.id) {
      return null;
    }

    return (
      <Container kind="panes">
        <ReactList
          ref={this.listRef}
          length={this.props.count}
          type={this.props.type || 'variable'}
          itemRenderer={this.renderItem}
          itemSizeEstimator={this.estimateItemSize}
        />
      </Container>
    );
  }
}

export default Widget.connect((state, props) => {
  return {
    listIds: state.get(`backend.list@${props.id}.list`),
    count: state.get(`backend.list@${props.id}.count`),
  };
})(DatagridTable);
