//T:2019-02-27

import React from 'react';
import Widget from 'laboratory/widget';
import Container from 'gadgets/container/widget';
import Button from 'gadgets/button/widget';

class WizardButtons extends Widget {
  constructor() {
    super(...arguments);
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

  renderButton(button, id, index, size) {
    button = button.toJS();
    const {questService, quest, questParams, ...props} = button;
    let mainProps = {};
    if (id === 'main') {
      mainProps = {
        busy: this.props.busy,
      };
    }
    return (
      <Button
        key={id}
        kind="action"
        place={`${index + 1}/${size}`}
        onClick={() =>
          this.handleButtonClick(id, questService, quest, questParams)
        }
        {...mainProps}
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
      <Container kind={this.props.containerKind}>
        {this.props.buttons
          .map((button, id) => this.renderButton(button, id, index++, size))
          .toArray()}
      </Container>
    );
  }
}

export default Widget.connectBackend({
  busy: 'busy',
  buttons: 'buttons',
})(WizardButtons);
