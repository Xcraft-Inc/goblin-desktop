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
    const {cellUI, column, columnsNo} = this.props;

    return <div className={this.styles.classNames.item}>{cellUI(column)}</div>;
  }
}

export default DatagridCell;
