import React from 'react';
import Widget from 'goblin-laboratory/widgets/widget';
import Container from 'goblin-gadgets/widgets/container/widget';
import Field from 'goblin-gadgets/widgets/field/widget';
import CollectionLoader from 'goblin-laboratory/widgets/collection-loader/widget.js';

/******************************************************************************/

const CustomField = Widget.connectBackend((state) => {
  return {field: state};
})((props) => {
  const {field} = props;
  if (!field) {
    return null;
  }
  return (
    <Field
      readonly={props.readonly}
      kind={field.get('kind')}
      model={`.${field.get('model')}`}
      labelText={field.get('labelText')}
    />
  );
});

class WorkitemFields extends Widget {
  constructor() {
    super(...arguments);
  }

  static get wiring() {
    return {
      id: 'id',
      fields: 'fields',
    };
  }

  render() {
    const {id, fields} = this.props;
    if (!id) {
      return null;
    }
    const fieldIds = fields.valueSeq();
    return (
      <Container kind="column" grow="1">
        <CollectionLoader ids={fieldIds} returnCollection={false}>
          <Container kind="pane">
            {Array.from(fieldIds).map((fieldId, i) => {
              return (
                <CustomField
                  key={i}
                  id={fieldId}
                  readonly={this.props.readonly}
                />
              );
            })}
          </Container>
        </CollectionLoader>
      </Container>
    );
  }
}

export default Widget.Wired(WorkitemFields);
