import React from 'react';
import View from 'laboratory/view';
import Widget from 'laboratory/widget';
import Detail from 'desktop/detail/widget';

class DetailView extends View {
  constructor () {
    super (...arguments);
  }

  render () {
    const {isDisplayed, hinter} = this.props;
    if (!isDisplayed) {
      return null;
    }

    let hinterName = hinter;
    if (hinter.endsWith ('-hidden')) {
      hinterName = hinter.replace ('-hidden', '');
    }

    const wireDetail = Widget.Wired (Detail);
    const hash = this.getHash ();
    const workitemId = hash.split ('.')[1];
    const WiredDetail = wireDetail (`${hinterName}-detail@${workitemId}`);
    return <WiredDetail />;
  }
}

export default Widget.WithRoute (
  DetailView,
  ['context', 'hinter'],
  null,
  true
) ('/:context/:view/:hinter');
