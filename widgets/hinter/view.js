import React from 'react';
import Widget from 'laboratory/widget';
import Hinter from 'desktop/hinter/widget';

class HinterView extends Widget {
  constructor () {
    super (...arguments);
  }

  render () {
    const {isDisplayed, hinter, workitemId} = this.props;
    if (!isDisplayed) {
      return null;
    }

    const wireHinter = Widget.Wired (Hinter);
    const WiredHinter = wireHinter (`${hinter}-hinter@${workitemId}`);
    return <WiredHinter />;
  }
}

export default Widget.WithRoute (HinterView, 'hinter') (
  '/:context/:view/:hinter'
);
