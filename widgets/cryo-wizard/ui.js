//T:2019-02-27
import React from 'react';
import C from 'goblin-laboratory/widgets/connect-helpers/c';
import Container from 'goblin-gadgets/widgets/container/widget';
import Ripley from 'goblin-desktop/widgets/ripley/widget';

function initialize(props) {
  return (
    <Container kind="column" grow="1">
      {'Loading...'}
    </Container>
  );
}

function configure(props) {
  return (
    <Container kind="column" grow="1">
      <Ripley id={C(`backend.${props.ripleyId}.id`)} />
    </Container>
  );
}

/******************************************************************************/
export default {
  mappers: {
    configure: state => {
      return {
        ripleyId: state.get('form.ripleyId'),
      };
    },
  },
  initialize: initialize,
  configure: configure,
};
