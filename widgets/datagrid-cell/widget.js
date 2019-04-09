//T:2019-02-27

import React from 'react';
import Form from 'laboratory/form';
import Widget from 'laboratory/widget';

class DatagridCell extends Form {
  constructor() {
    super(...arguments);

    this.renderCell = this.renderCell.bind(this);
  }

  static get wiring() {
    return {
      id: 'id',
    };
  }

  renderCell() {
    const {cellUI, column, index} = this.props;

    if (cellUI) {
      return cellUI(column, index);
    }
  }

  render() {
    return (
      <div className={this.styles.classNames.item}>{this.renderCell()}</div>
    );
  }
}

export default Widget.connect((state, props) => {
  const column = state.get(`backend.${props.id}.columns[${props.index}]`);

  return {
    column,
  };
})(DatagridCell);
