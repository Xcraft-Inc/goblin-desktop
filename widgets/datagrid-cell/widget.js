import React from 'react';
import Form from 'laboratory/form';
import _ from 'lodash';

class DatagridCell extends Form {
  constructor() {
    super(...arguments);
  }

  static get wiring() {
    return {
      id: 'id',
    };
  }

  render() {
    const {cellUI, column, columnsNo, margin} = this.props;

    function renderCell() {
      if (cellUI) {
        return cellUI(column);
      }
    }

    return <div className={this.styles.classNames.item}>{renderCell()}</div>;
  }
}

export default DatagridCell;
