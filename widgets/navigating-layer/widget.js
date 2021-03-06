//T:2019-02-27
import React from 'react';
import Widget from 'goblin-laboratory/widgets/widget';

class NavigatingLayer extends Widget {
  constructor() {
    super(...arguments);
  }

  render() {
    let navigatingStyle = {};
    if (this.props.navigating || this.props.working) {
      navigatingStyle = {
        pointerEvents: 'none',
      };
    }
    return <div style={navigatingStyle}>{this.props.children}</div>;
  }
}

export default Widget.connect((state, props) => {
  const navigating = state.get(`backend.${props.desktopId}.navigating`);
  const working = state.get(`backend.${props.desktopId}.working`);
  return {navigating, working};
})(NavigatingLayer);
