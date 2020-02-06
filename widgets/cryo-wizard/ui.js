//T:2019-02-27
import React from 'react';
import C from 'goblin-laboratory/widgets/connect-helpers/c';
import Container from 'goblin-gadgets/widgets/container/widget';
import Ripley from 'goblin-desktop/widgets/ripley/widget';

function configure(props) {
  return (
    <Container kind="column" grow="1">
      <Ripley id={C(`backend.${props.ripleyId}`)} />
    </Container>
  );
}

/******************************************************************************/
export default {
  mapper: {
    configure: wizard => {
      return {
        ripleyId: wizard.get('form.ripleyId'),
      };
    },
  },
  configure: configure,
};
