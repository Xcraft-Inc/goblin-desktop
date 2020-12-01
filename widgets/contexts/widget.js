//T:2019-02-27
import React from 'react';
import Button from 'goblin-gadgets/widgets/button/widget';
import Widget from 'goblin-laboratory/widgets/widget';
import Container from 'goblin-gadgets/widgets/container/widget';
class ContextButtonNC extends Widget {
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
        tooltip={this.props.tooltip}
        badgeColor="dark"
        badgeSize={1.1}
        badgePosition="over"
        badgeValue={this.props.openTabs}
        badgePush={false}
        badgeShape="circle"
      />
    );
  }
}

const ContextButton = Widget.connect((state, props) => {
  const byContext = state.get(`backend.${props.desktopId}.workitemsByContext`);
  let openTabs = 0;
  if (byContext) {
    const list = byContext.get(props.contextId);
    if (list) {
      openTabs = list.size;
    }
  }
  return {openTabs};
})(ContextButtonNC);

class Contexts extends Widget {
  constructor() {
    super(...arguments);
    this.goToContext = this.goToContext.bind(this);
  }

  static get wiring() {
    return {
      id: 'id',
      desktopId: 'desktopId',
      contexts: 'contexts',
    };
  }

  navToContext(contextId) {
    if (this.props.current === contextId) {
      return;
    }
    this.cmd('desktop.navToContext', {
      id: this.props.desktopId,
      contextId,
    });
  }

  goToContext(contextId) {
    this.navToContext(contextId);
  }

  renderContext(context) {
    const contextId = context.get('contextId');
    return (
      <ContextButton
        key={contextId}
        desktopId={this.props.desktopId}
        context={context}
        contextId={contextId}
        goToContext={this.goToContext}
        active={this.props.current === contextId}
        tooltip={context.get('name')}
      />
    );
  }

  renderContexts() {
    if (!this.props.contexts) {
      return null;
    }
    return this.props.contexts
      .valueSeq()
      .map((context) => this.renderContext(context))
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

export default Widget.Wired(
  Widget.connect((state, props) => {
    const current = state.get(`backend.${props.desktopId}.current.workcontext`);
    return {current};
  })(Contexts)
)();
