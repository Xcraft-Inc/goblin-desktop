'use strict';

import Widget from 'laboratory/widget';
import React from 'react';
import Container from 'gadgets/container/widget';
import Button from 'gadgets/button/widget';
import WidgetDoc from 'gadgets/widget-doc/widget';

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
    const {enabled} = this.props;
    return (
      <Container kind="row">
        <Button
          kind="button-footer"
          text="WidgetDoc"
          onClick={this.toggleEnabled}
        />
        {enabled ? this.renderWidgetDoc() : null}
      </Container>
    );
  }
}

export default Widget.connectWidget(state => {
  return {
    enabled: state ? state.get('enabled') : false,
  };
})(WidgetDocCaller);
