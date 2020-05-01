//T:2019-02-27
import React from 'react';
import T from 't';
import Container from 'goblin-gadgets/widgets/container/widget';
import Label from 'goblin-gadgets/widgets/label/widget';
import Field from 'goblin-gadgets/widgets/field/widget';
import Separator from 'goblin-gadgets/widgets/separator/widget';

function prepare(props) {
  return (
    <Container kind="column" grow="1">
      <Label kind="title" text={T('Ouvrir le document')} />
      <Separator kind="space" height="30px" />
      <Container kind="row" width="500px">
        <Field labelText="ID" model=".form.entityId" />
      </Container>
    </Container>
  );
}

/******************************************************************************/
export default {
  prepare,
};
