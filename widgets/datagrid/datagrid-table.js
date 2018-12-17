import React from 'react';
import Widget from 'laboratory/widget';
import ReactList from 'react-list';
import throttle from 'lodash/throttle';
import _ from 'lodash';

import Container from 'gadgets/container/widget';

class DatagridTable extends Widget {
  constructor() {
    super(...arguments);

    this.renderTable = this.renderTable.bind(this);
  }

  renderTable() {
    const ids = this.props.listIds.toJS();
    return (
      <div>
        {Object.keys(ids).map(function(key) {
          return <div key={key}>{ids[key]}</div>;
        })}
      </div>
    );
  }

  render() {
    if (!this.props.id) {
      return null;
    }

    return <Container kind="panes">{this.renderTable()}</Container>;
  }
}

export default Widget.connect((state, props) => {
  return {
    listIds: state.get(`backend.datagrid@${props.id}.list`),
  };
})(DatagridTable);
