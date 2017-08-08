import React from 'react';
import Widget from 'laboratory/widget';
import Detail from 'desktop/detail/widget';

class DetailView extends Widget {
  constructor () {
    super (...arguments);
  }

  render () {
    const {isDisplayed, hinter} = this.props;
    if (!isDisplayed) {
      return null;
    }

    const wireDetail = Widget.Wired (Detail);
    const hash = this.getHash ();
    const workitemId = hash.split ('.')[1];
    const WiredDetail = wireDetail (`${hinter}-detail@${workitemId}`);
    return <WiredDetail />;
  }
}

export default Widget.WithRoute (DetailView, 'hinter', null, true) (
  '/:context/:view/:hinter'
);
