//T:2019-02-27
import React from 'react';
import T from 't';
import Container from 'goblin-gadgets/widgets/container/widget';
import Label from 'goblin-gadgets/widgets/label/widget';
import Separator from 'goblin-gadgets/widgets/separator/widget';
import Field from 'goblin-gadgets/widgets/field/widget';
import * as DataCheckHelpers from '../helpers/data-check-helpers';

/******************************************************************************/

function renderBool(item, index) {
  if (item.title) {
    return (
      <React.Fragment key={index}>
        {item.separator ? <Separator kind="exact" height="10px" /> : null}
        <Label text={item.title} />
        <Separator kind="exact" height="5px" />
      </React.Fragment>
    );
  } else {
    return (
      <Field
        key={index}
        kind="bool"
        model={`.form.${item.option}`}
        labelWidth="0px"
        labelText={item.description}
        verticalSpacing="compact"
      />
    );
  }
}

function renderBools(position) {
  return DataCheckHelpers.items
    .filter(item => item.position === position)
    .map((item, index) => renderBool(item, index));
}

/******************************************************************************/

function prepare(props) {
  return (
    <Container kind="column" grow="1">
      <Container kind="row" grow="1">
        <Container kind="column" grow="1">
          {renderBools('left')}
        </Container>
        <Container kind="column" grow="1">
          {renderBools('right')}
        </Container>
      </Container>

      <Separator kind="exact" height="20px" />

      <Container kind="row" grow="1">
        <Container kind="column" grow="1">
          <Label text={T('Types des champs à traiter :')} />
          <Separator kind="exact" height="5px" />
          <Container kind="row">
            <Field
              kind="gadget"
              name="typesTable"
              selectionMode="multi"
              frame={true}
              hasButtons={true}
              height="300px"
              grow="1"
            />
          </Container>
        </Container>
        <Container kind="column" width="20px" />
        <Container kind="column" grow="1">
          <Label text={T('Entités à traiter :')} />
          <Separator kind="exact" height="5px" />
          <Container kind="row">
            <Field
              kind="gadget"
              name="entitiesTable"
              selectionMode="multi"
              frame={true}
              hasButtons={true}
              height="300px"
              grow="1"
            />
          </Container>
        </Container>
      </Container>
    </Container>
  );
}

/******************************************************************************/

export default {
  prepare,
};
