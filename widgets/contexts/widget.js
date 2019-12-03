//T:2019-02-27
import React from 'react';
import Button from 'goblin-gadgets/widgets/button/widget';
import Widget from 'goblin-laboratory/widgets/widget';
import Container from 'goblin-gadgets/widgets/container/widget';

export default class Contexts extends Widget {
  constructor() {
    super(...arguments);
    this.goToContext = this.goToContext.bind(this);
  }

  static get wiring() {
    return {
      id: 'id',
      desktopId: 'desktopId',
      contexts: 'contexts',
      current: 'current',
    };
  }

  navToContext(contextId) {
    this.cmd('desktop.nav-to-context', {
      id: this.props.desktopId,
      contextId,
    });
  }

  goToContext(contextId) {
    this.do('set-current', {contextId});
    this.navToContext(contextId);
  }

  renderContext(context) {
    const contextId = context.get('contextId');
    return (
      <ContextButton
        key={contextId}
        context={context}
        goToContext={this.goToContext}
        active={this.props.current === contextId}
      />
    );
  }

  renderContexts() {
    if (!this.props.contexts) {
      return null;
    }
    return this.props.contexts
      .map(context => this.renderContext(context))
      .toArray();
  }

  render() {
    if (!this.props.id) {
      return null;
    }

    return <Container kind="main-tab">{this.renderContexts()}</Container>;
  }
}

/******************************************************************************/

class ContextButton extends Widget {
  constructor() {
    super(...arguments);
    this.handleClick = this.handleClick.bind(this);
  }

  handleClick() {
    this.props.goToContext(this.props.context.get('contextId'));
  }

  render() {
    return (
      <Button
        key={this.props.context.get('contextId')}
        text={this.props.context.get('name')}
        kind="main-tab"
        onClick={this.handleClick}
        active={this.props.active}
      />
    );
  }
}
