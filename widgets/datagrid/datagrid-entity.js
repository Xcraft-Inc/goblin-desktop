import React from 'react';
import Form from 'laboratory/form';
import _ from 'lodash';

class DataGridEntity extends Form {
  constructor() {
    super(...arguments);
  }

  static get wiring() {
    return {
      id: 'id',
    };
  }

  render() {
    const {id, customUI} = this.props;
    const self = this;
    if (!id) {
      return null;
    }

    const Form = this.Form;

    let RowUI = <div>Missing row custom UI</div>;

    if (customUI && customUI.row) {
      RowUI = this.WithState(customUI.row, '')();
    }

    return (
      <Form {...self.formConfig}>
        <RowUI />
      </Form>
    );
  }
}

export default DataGridEntity;
