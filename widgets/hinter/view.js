import React from 'react';
import Widget from 'laboratory/widget';
import Hinter from 'desktop/hinter/widget';

class HinterView extends Widget {
  constructor () {
    super (...arguments);
  }

  render () {
    const {isDisplayed, hinter} = this.props;
    if (!isDisplayed) {
      return null;
    }

    const wireHinter = Widget.Wired (Hinter);
    const hash = this.getHash ();
    const workitemId = hash.split ('.')[1];
    const WiredHinter = wireHinter (`${hinter}-hinter@${workitemId}`);
    return <WiredHinter />;
  }
}

export default Widget.WithRoute (HinterView, 'hinter', null, true) (
  '/:context/:view/:hinter'
);
