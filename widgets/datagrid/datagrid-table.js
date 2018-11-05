import React from 'react';
import Widget from 'laboratory/widget';
import ReactList from 'react-list';
import _ from 'lodash';

import Container from 'gadgets/container/widget';

class DatagridTable extends Widget {
  constructor() {
    super(...arguments);
    const self = this;
    this.renderItem = this.renderItem.bind(this);
    this.renderTable = this.renderTable.bind(this);
    this.renderRow = this.renderRow.bind(this);

    const doAsList = (quest, args) => {
      const service = self.props.id.split('@')[0];
      self.doAs(service, quest, args);
    };

    const load = range => {
      let cFrom = this.getFormValue('.from');
      let cTo = this.getFormValue('.to');
      if (range[0] < this.props.pageSize) {
        return;
      }
      if (range[0] - 10 < cFrom || range[1] + 10 >= cTo) {
        doAsList('load-range', {from: range[0], to: range[1]});
      }
    };
    this.loadIndex = _.debounce(load, 200);
  }

  static connectTo(instance) {
    return Widget.Wired(DatagridTable)(`list@${instance.props.id}`);
  }

  static get wiring() {
    return {
      id: 'id',
      count: 'count',
      pageSize: 'pageSize',
      type: 'type',
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

    if (items.length) {
      const range = [items[0].index, items[items.length - 1].index];
      // Horrible hack qui corrige le problème de la liste de gauche qui est
      // vide la plupart du temps lors de l'ouverture du panneau de recherche !
      if (range.length !== 2 || range[0] !== 0 || range[1] !== 0) {
        this.loadIndex(range);
      }
    }

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
          ref={this.props.onRef}
          pageSize={this.props.pageSize / 2}
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
