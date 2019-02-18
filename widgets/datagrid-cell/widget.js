import React from 'react';
import Form from 'laboratory/form';
import _ from 'lodash';
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
    const {cellUI, column, columns} = this.props;

    if (cellUI) {
      return cellUI(column, columns);
    }
  }

  render() {
    return (
      <div className={this.styles.classNames.item}>{this.renderCell()}</div>
    );
  }
}

export default Widget.connect((state, props) => {
  return {
    column: state.get(`backend.${props.id}.columns[${props.index}]`),
    columns: state.get(`backend.${props.id}.columns`),
  };
})(DatagridCell);
