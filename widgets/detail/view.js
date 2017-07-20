import React from 'react';
import Widget from 'laboratory/widget';
import Detail from 'desktop/detail/widget';

class DetailView extends Widget {
  constructor () {
    super (...arguments);
  }

  render () {
    const {isDisplayed, hinter, workitemId} = this.props;
    if (!isDisplayed) {
      return null;
    }

    const wireDetail = Widget.Wired (Detail);
    const WiredDetail = wireDetail (`${hinter}-detail@${workitemId}`);
    return <WiredDetail />;
  }
}

export default Widget.WithRoute (DetailView, 'hinter') (
  '/:context/:view/:hinter'
);
