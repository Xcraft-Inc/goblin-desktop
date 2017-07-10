import React from 'react';
import Widget from 'laboratory/widget';
import Hinter from 'desktop/hinter/widget';

class HinterView extends Widget {
  constructor (props, context) {
    super (props, context);
  }

  render () {
    const {isDisplayed, hinter, workitem} = this.props;
    if (!isDisplayed) {
      return null;
    }

    const wireHinter = Widget.Wired (Hinter);
    const WiredHinter = wireHinter (`${hinter}-hinter@${workitem}`);
    return <WiredHinter />;
  }
}

export default Widget.WithRoute (HinterView, 'hinter') (
  '/:context/:view/:hinter'
);
