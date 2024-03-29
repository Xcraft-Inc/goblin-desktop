//T:2019-02-27

import Widget from 'goblin-laboratory/widgets/widget';
import React from 'react';
import Container from 'goblin-gadgets/widgets/container/widget';
import Button from 'goblin-gadgets/widgets/button/widget';
import T from 't';

const LocalStateMonitor = Widget.connect((state, props) => {
  return {size: state.get('backend').size};
})(function (props) {
  return <div style={{fontWeight: 900}}>LocalState: {props.size}</div>;
});

class Monitor extends Widget {
  constructor() {
    super(...arguments);
    this.toggleEnabled = this.toggleEnabled.bind(this);
    this.collectRequested = false;
  }

  toggleEnabled() {
    this.dispatch({type: 'TOGGLE'});
  }

  renderMonitors() {
    return (
      <div style={{margin: '10px'}}>
        <LocalStateMonitor />
      </div>
    );
  }

  render() {
    const {prototypeMode, enabled} = this.props;
    if (!prototypeMode) {
      return null;
    }

    return (
      <Container kind="row">
        <Button
          kind="button-footer"
          text={T('Monitor')}
          onClick={this.toggleEnabled}
        />
        {enabled ? this.renderMonitors() : null}
      </Container>
    );
  }
}

export default Widget.connect((state, props) => {
  const stateWidgets = state.get('widgets').get(props.id);
  const userSession = Widget.getUserSession(state);
  return {
    prototypeMode: userSession.get('prototypeMode'),
    enabled: stateWidgets ? stateWidgets.get('enabled') : false,
  };
})(Monitor);
