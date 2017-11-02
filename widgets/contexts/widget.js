import React from 'react';
import Button from 'gadgets/button/widget';
import Widget from 'laboratory/widget';
import Container from 'gadgets/container/widget';
const Wired = Widget.Wired (Button);

class Contexts extends Widget {
  constructor () {
    super (...arguments);
  }

  static get wiring () {
    return {
      id: 'id',
      desktopId: 'desktopId',
      contexts: 'contexts',
      current: 'current',
    };
  }

  navToContext (contextId) {
    this.cmd ('desktop.nav-to-context', {
      id: this.props.desktopId,
      contextId,
    });
  }

  goToContext (contextId) {
    this.do ('set-current', {contextId});
    this.navToContext (contextId);
  }

  render () {
    const {contexts, current} = this.props;

    if (!this.props.id) {
      return null;
    }
    let renderedContexts = [];
    if (contexts) {
      renderedContexts = contexts.toArray ();
    }

    return (
      <Container kind="main-tab">
        {renderedContexts.map ((v, k) => {
          return (
            <Button
              key={k}
              text={v.get ('name')}
              kind="main-tab"
              onClick={() => this.goToContext (v.get ('contextId'))}
              active={current === v.get ('contextId') ? 'true' : 'false'}
            />
          );
        })}
      </Container>
    );
  }
}

export default Contexts;
