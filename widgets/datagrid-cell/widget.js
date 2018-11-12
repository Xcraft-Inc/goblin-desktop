import React from 'react';
import Form from 'laboratory/form';
import _ from 'lodash';
import Widget from 'laboratory/widget';

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
    const {cellUI, column, margin} = this.props;

    function renderCell() {
      if (cellUI) {
        return cellUI(column);
      }
    }

    return <div className={this.styles.classNames.item}>{renderCell()}</div>;
  }
}

export default Widget.connect((state, props) => {
  return {
    column: state.get(`backend.${props.id}.columns[${props.index}]`),
  };
})(DatagridCell);
