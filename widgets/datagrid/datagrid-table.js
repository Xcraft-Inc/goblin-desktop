import React from 'react';
import Widget from 'laboratory/widget';
import ReactList from 'react-list';
import throttle from 'lodash/throttle';
import _ from 'lodash';

import Container from 'gadgets/container/widget';

class DatagridTable extends Widget {
  constructor() {
    super(...arguments);

    this._threshold = 80;
    this._fetchInternal = this._fetchInternal.bind(this);
    this._fetch = throttle(this._fetchInternal, 200).bind(this);
    this._range = [];

    this.listRef = React.createRef();

    this.renderItem = this.renderItem.bind(this);
    this.renderTable = this.renderTable.bind(this);
    this.renderRow = this.renderRow.bind(this);
  }

  _fetchInternal() {
    if (!this.listRef.current) {
      return;
    }

    const range = this.listRef.current
      ? this.listRef.current.getVisibleRange()
      : [0, 0];
    const {count} = this.props;

    if (
      range[0] >= this._range[0] - this._threshold / 2 &&
      range[1] <= this._range[1] + this._threshold / 2
    ) {
      return;
    }

    this._range = range.slice();

    /* Add a margin of this._threshold entries (if possible) for the range */
    range[0] =
      range[0] >= this._threshold //
        ? range[0] - this._threshold
        : 0;
    range[1] =
      range[1] + this._threshold < count
        ? range[1] + this._threshold
        : count - 1;

    this.do('fetch', {range});
  }

  static connectTo(instance) {
    return Widget.Wired(DatagridTable)(`list@${instance.props.id}`);
  }

  static get wiring() {
    return {
      id: 'id',
      count: 'count',
      type: 'type',
      contentIndex: 'contentIndex',
    };
  }

  renderItem(index, key) {
    return {model: `.list.${index}-item`, index, key};
  }

  renderRow(row) {
    const loadingWrapper = props => {
      if (props._loading) {
        return <div>loading...</div>;
      } else {
        const Item = this.props.renderItem;
        return <Item {...props} />;
      }
    };
    const ListItem = this.getWidgetToFormMapper(loadingWrapper, item => {
      if (!item) {
        return {_loading: true};
      } else {
        const entity = this.getModelValue(`backend.${item.get('id')}`, true);

        if (!entity) {
          return {_loading: true};
        } else {
          return this.props.mapItem(entity, row.index);
        }
      }
    })(row.model);

    return <ListItem key={row.key} />;
  }

  renderTable(items, ref) {
    if (!items) {
      return null;
    }

    /*if (items.length) {
      const range = [items[0].index, items[items.length - 1].index];
      // Horrible hack qui corrige le problème de la liste de gauche qui est
      // vide la plupart du temps lors de l'ouverture du panneau de recherche !
      if (range.length !== 2 || range[0] !== 0 || range[1] !== 0) {
        this.loadIndex(range);
      }
    }*/

    return (
      <div ref={ref}>
        {items.map(row => {
          return this.renderRow(row);
        })}
      </div>
    );
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
          type={this.props.type}
          itemsRenderer={this.renderTable}
          itemRenderer={this.renderItem}
          className={this.props.className}
          useStaticSize={this.props.type === 'variable' ? false : true}
          threshold={this.props.type === 'uniform' ? 300 : 100}
        />
      </Container>
    );
  }
}

export default DatagridTable;
