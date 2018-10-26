import React from 'react';
import Form from 'laboratory/form';
import _ from 'lodash';

import Label from 'gadgets/label/widget';
import Button from 'gadgets/button/widget';
import Field from 'gadgets/field/widget';

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
    const self = this;
    if (!this.props.id) {
      return null;
    }

    const Form = this.Form;

    return (
      <Form {...self.formConfig}>
        <Field kind="label" grow="1" labelWidth="0px" model=".nabuId" />
        <Field model=".description" grow="1" labelWidth="0px" />
      </Form>
    );
  }
}

export default DataGridEntity;
