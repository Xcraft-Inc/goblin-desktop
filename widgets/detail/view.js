//T:2019-02-27

import React from 'react';
import View from 'goblin-laboratory/widgets/view';
import Detail from 'goblin-desktop/widgets/detail/widget';
import WithRoute from 'goblin-laboratory/widgets/with-route/with-route.js';

class DetailView extends View {
  constructor() {
    super(...arguments);
  }

  render() {
    const {isDisplayed, hinter} = this.props;
    if (!isDisplayed) {
      return null;
    }

    let hinterName = hinter;
    if (hinter.endsWith('-hidden')) {
      hinterName = hinter.replace('-hidden', '');
    }

    const hash = this.getHash();
    const workitemId = hash.split('.')[1];
    return (
      <Detail
        id={`detail@${hinterName}@${workitemId}`}
        leftPanelWorkitemId={this.props.leftPanelWorkitemId}
      />
    );
  }
}

export default WithRoute(
  DetailView,
  ['context', 'hinter'],
  null,
  true
)('/:context/:view/:hinter');
