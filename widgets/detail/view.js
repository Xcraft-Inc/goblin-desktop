import React from 'react';
import Widget from 'laboratory/widget';
import Detail from 'desktop/detail/widget';

class DetailView extends Widget {
  constructor (props, context) {
    super (props, context);
  }

  render () {
    const {isDisplayed, hinter, workitem} = this.props;
    if (!isDisplayed) {
      return null;
    }

    const wireDetail = Widget.Wired (Detail);
    const WiredDetail = wireDetail (`${hinter}-detail@${workitem}`);
    return <WiredDetail />;
  }
}

export default Widget.WithRoute (DetailView, 'hinter') (
  '/:context/:view/:hinter'
);
