//T:2019-02-27
import React from 'react';

import Container from 'goblin-gadgets/widgets/container/widget';
import Widget from 'goblin-laboratory/widgets/widget';
import Ripley from 'goblin-desktop/widgets/ripley/widget';

function configure(props) {
  const WiredRipley = Widget.Wired(Ripley)(props.ripleyId);

  return (
    <Container kind="column" grow="1">
      <WiredRipley />
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
