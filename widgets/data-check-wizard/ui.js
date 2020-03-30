//T:2019-02-27
import React from 'react';
import T from 't';
import Container from 'goblin-gadgets/widgets/container/widget';
import Label from 'goblin-gadgets/widgets/label/widget';
import Separator from 'goblin-gadgets/widgets/separator/widget';
import Field from 'goblin-gadgets/widgets/field/widget';
import * as DataCheckHelpers from '../helpers/data-check-helpers';

/******************************************************************************/

function renderBool(position, item, index) {
  if (position !== item.position) {
    return null;
  }

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
  return DataCheckHelpers.items.map((item, index) =>
    renderBool(position, item, index)
  );
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
      <Separator kind="exact" height="10px" />
      <Label text={T("Sélectionnez les types d'entité à traiter :")} />
      <Separator kind="exact" height="5px" />
      <Container kind="row">
        <Field
          kind="gadget"
          name="tablesTable"
          selectionMode="multi"
          frame={true}
          hasButtons={true}
          height="300px"
          grow="1"
        />
      </Container>
    </Container>
  );
}

/******************************************************************************/

export default {
  prepare,
};
