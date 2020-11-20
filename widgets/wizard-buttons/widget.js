//T:2019-02-27

import React from 'react';
import Widget from 'goblin-laboratory/widgets/widget';
import Container from 'goblin-gadgets/widgets/container/widget';
import Button from 'goblin-gadgets/widgets/button/widget';
import KeyTrap from 'goblin-gadgets/widgets/key-trap.js';

/******************************************************************************/

class WizardButtons extends Widget {
  constructor() {
    super(...arguments);

    this.handleKeyEnter = this.handleKeyEnter.bind(this);
    this.handleKeyEscape = this.handleKeyEscape.bind(this);
  }

  componentWillMount() {
    KeyTrap.bind('Enter', this.handleKeyEnter);
    KeyTrap.bind('Escape', this.handleKeyEscape);
  }

  componentWillUnmount() {
    KeyTrap.unbind('Enter', this.handleKeyEnter);
    KeyTrap.unbind('Escape', this.handleKeyEscape);
  }

  handleKeyEnter() {
    const button = this.props.buttons.get('main');
    if (button && !button.get('disabled')) {
      const {questService, quest, questParams} = button.toJS();
      this.handleButtonClick('main', questService, quest, questParams);
    }
  }

  handleKeyEscape() {
    const button = this.props.buttons.get('cancel');
    if (button && !button.get('disabled')) {
      const {questService, quest, questParams} = button.toJS();
      this.handleButtonClick('cancel', questService, quest, questParams);
    }
  }

  handleButtonClick(id, questService, quest, questParams) {
    switch (id) {
      case 'main':
        this.props.onNext();
        break;
      case 'cancel':
        this.props.onCancel();
        break;
      default:
        break;
    }

    if (quest) {
      if (questService) {
        this.doFor(questService, quest, questParams);
      } else {
        this.doAs(this.service, quest, questParams);
      }
    }
  }

  /******************************************************************************/

  renderButton(button, id, index, size) {
    button = button.toJS();
    const {questService, quest, questParams, ...props} = button;

    return (
      <Button
        key={id}
        kind="action"
        place={`${index + 1}/${size}`}
        onClick={() =>
          this.handleButtonClick(id, questService, quest, questParams)
        }
        {...props}
      />
    );
  }

  render() {
    if (!this.props.buttons) {
      return null;
    }
    let index = 0;
    const size = this.props.buttons.size;
    return (
      <Container kind={this.props.containerKind} busy={this.props.busy}>
        {this.props.buttons
          .map((button, id) => this.renderButton(button, id, index++, size))
          .toArray()}
      </Container>
    );
  }
}

/******************************************************************************/

export default Widget.connectBackend({
  busy: 'busy',
  buttons: 'buttons',
})(WizardButtons);
