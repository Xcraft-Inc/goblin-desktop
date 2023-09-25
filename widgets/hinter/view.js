import React from 'react';
import Widget from 'goblin-laboratory/widgets/widget';
import Hinter from 'goblin-desktop/widgets/hinter/widget';
import WithRoute from 'goblin-laboratory/widgets/with-route/with-route.js';

class HinterView extends Widget {
  constructor() {
    super(...arguments);
  }

  render() {
    const {isDisplayed, hinter} = this.props;
    if (!isDisplayed) {
      return null;
    }

    if (hinter.endsWith('-hidden')) {
      return null;
    }

    const hash = this.getHash();
    const workitemId = hash.split('.')[1];
    return <Hinter id={`${hinter}-hinter@${workitemId}`} />;
  }
}

export default WithRoute(
  HinterView,
  'hinter',
  null,
  true
)('/:context/:view/:hinter');
