//T:2019-02-27

import React from 'react';
import NabuMessage from 'nabu/nabu-message/widget';

/******************************************************************************/

function renderPanel(props) {
  return <NabuMessage entityId={props.entityId} id={props.id} />;
}

/******************************************************************************/
export default {
  panel: {
    readonly: renderPanel,
    edit: renderPanel,
  },
  plugin: {
    readonly: {
      compact: renderPanel,
      extend: renderPanel,
    },
    edit: {
      compact: renderPanel,
      extend: renderPanel,
    },
  },
};
