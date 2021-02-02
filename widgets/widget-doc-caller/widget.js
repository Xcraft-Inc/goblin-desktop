'use strict';

import Widget from 'goblin-laboratory/widgets/widget';
import React from 'react';
import Container from 'goblin-gadgets/widgets/container/widget';
import Button from 'goblin-gadgets/widgets/button/widget';
import WidgetDoc from 'goblin-gadgets/widgets/widget-doc/widget';

class WidgetDocCaller extends Widget {
  constructor() {
    super(...arguments);
    this.toggleEnabled = this.toggleEnabled.bind(this);
  }

  toggleEnabled() {
    this.dispatch({type: 'TOGGLE'});
  }

  renderWidgetDoc() {
    return (
      <div className={this.styles.classNames.fullScreen}>
        <WidgetDoc
          widgetId={`${this.props.desktopId}$widget-doc`}
          onClose={this.toggleEnabled}
        />
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
          kind={this.props.kind === 'minimal' ? null : 'button-footer'}
          border={this.props.kind === 'minimal' ? 'none' : null}
          text="WidgetDoc"
          onClick={this.toggleEnabled}
        />
        {enabled ? this.renderWidgetDoc() : null}
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
})(WidgetDocCaller);
