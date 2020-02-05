//T:2019-02-27
import React from 'react';
import T from 't';
import Container from 'goblin-gadgets/widgets/container/widget';
import Label from 'goblin-gadgets/widgets/label/widget';
import Separator from 'goblin-gadgets/widgets/separator/widget';
import Field from 'goblin-gadgets/widgets/field/widget';

function prepare(props) {
  return (
    <Container kind="column" grow="1">
      <Label text={T('Sélectionnez les entités à vérifier.')} />
      <Separator kind="space" height="10px" />

      <Field
        kind="bool"
        model=".form.repair"
        labelWidth="0px"
        labelText={T('Réparer')}
        verticalSpacing="compact"
      />

      <Separator kind="space" height="10px" />
      <Container kind="row" width="500px">
        <Field
          kind="gadget"
          name="tablesTable"
          selectionMode="multi"
          frame="true"
          hasButtons="true"
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
