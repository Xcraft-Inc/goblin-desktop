//T:2019-02-27
import React from 'react';
import T from 't';
import Container from 'goblin-gadgets/widgets/container/widget';
import Label from 'goblin-gadgets/widgets/label/widget';
import Field from 'goblin-gadgets/widgets/field/widget';

function prepare(props) {
  return (
    <Container kind="column" grow="1">
      <Label kind="title" text={T('Quest Launcher')} />
      <Container kind="row">
        <Field labelText="payload" grow="1" rows={4} model=".form.payload" />
      </Container>
      <Container kind="row">
        <Field labelText="quest" model=".form.quest" />
      </Container>
    </Container>
  );
}

/******************************************************************************/
export default {
  prepare,
};
