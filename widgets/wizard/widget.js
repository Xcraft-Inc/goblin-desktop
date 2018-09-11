import React from 'react';
import Form from 'laboratory/form';
import Container from 'gadgets/container/widget';
import Label from 'gadgets/label/widget';
import Button from 'gadgets/button/widget';
import importer from 'laboratory/importer/';

import DialogModal from 'gadgets/dialog-modal/widget';
import Separator from 'gadgets/separator/widget';

const uiImporter = importer('ui');
class Wizard extends Form {
  constructor() {
    super(...arguments);
    this.onNext = this.onNext.bind(this);
    this.onCancel = this.onCancel.bind(this);
    this.setForm = this.setForm.bind(this);
    this.doProxy = this.doProxy.bind(this);
    this.onBackgroundClick = this.onBackgroundClick.bind(this);
  }

  static get wiring() {
    return {
      id: 'id',
      title: 'title',
      dialog: 'dialog',
      step: 'step',
      busy: 'busy',
      buttons: 'buttons',
    };
  }

  onNext() {
    const service = this.props.id.split('@')[0];
    this.submitAs(service);
    this.doAs(service, 'next');
  }

  onCancel() {
    const service = this.props.id.split('@')[0];
    this.doAs(service, 'cancel');
  }

  onBackgroundClick() {
    if (this.props.dialog.get('cancelOnBackgroundClick')) {
      this.onCancel();
    }
  }

  doProxy(action, args) {
    const workitem = this.props.id.split('@')[0];
    this.doAs(workitem, action, args);
  }

  setForm(path, newValue) {
    const workitem = this.props.id.split('@')[0];
    if (path.startsWith('.')) {
      path = path.substring(1);
    }
    this.doAs(workitem, 'change', {path, newValue});
  }

  handleButtonClick(id, quest, questParams) {
    switch (id) {
      case 'main':
        this.onNext();
        break;
      case 'cancel':
        this.onCancel();
        break;
      default:
        break;
    }

    if (quest) {
      this.doAs(this.service, quest, questParams);
    }
  }

  renderButton(button, id, index, size) {
    button = button.toJS();
    const {quest, questParams, ...props} = button;
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
        onClick={() => this.handleButtonClick(id, quest, questParams)}
        {...mainProps}
        {...props}
      />
    );
  }

  renderButtons(kind) {
    if (!this.props.buttons) {
      return null;
    }
    let index = 0;
    const size = this.props.buttons.size;
    return (
      <Container kind={kind}>
        {this.props.buttons
          .map((button, id) => this.renderButton(button, id, index++, size))
          .toArray()}
      </Container>
    );
  }

  render() {
    const {id, title, kind} = this.props;
    if (!id) {
      return null;
    }
    let Step = null;
    const wizard = this.props.id.split('@')[0];
    const wizardUI = uiImporter(wizard);

    if (!wizardUI[this.props.step]) {
      Step = props => {
        return null;
      };
    } else {
      Step = wizardUI[this.props.step];
      if (wizardUI.mappers && wizardUI.mappers[this.props.step]) {
        Step = this.mapWidget(
          Step,
          wizardUI.mappers[this.props.step],
          `backend.${this.props.id}`
        );
      }
    }

    const Form = this.Form;

    const mode = this.props.dialog.get('mode');
    switch (kind) {
      case 'dialog': {
        switch (mode) {
          case 'custom':
            return (
              <Form {...this.formConfig}>
                <Step
                  {...this.props}
                  theme={this.context.theme}
                  do={this.doProxy}
                  setForm={this.setForm}
                />
              </Form>
            );
          case 'simple':
            return (
              <Form {...this.formConfig}>
                <Step
                  {...this.props}
                  theme={this.context.theme}
                  do={this.doProxy}
                  setForm={this.setForm}
                />
              </Form>
            );
          default:
            return (
              <DialogModal
                width={this.props.dialog.get('width')}
                height={this.props.dialog.get('height')}
                zIndex={this.props.dialog.get('zIndex')}
                onBackgroundClick={this.onBackgroundClick}
              >
                <Form {...this.formConfig}>
                  <Step
                    {...this.props}
                    theme={this.context.theme}
                    do={this.doProxy}
                    setForm={this.setForm}
                  />
                </Form>
                <Separator kind="space" height="20px" />
                {this.renderButtons('row')}
              </DialogModal>
            );
        }
      }

      default: {
        switch (mode) {
          case 'simple': {
            return (
              <Container
                kind="view"
                width={this.props.dialog.get('containerWidth') || '800px'}
                spacing="large"
              >
                <Form
                  {...this.formConfigWithComponent(() => (
                    <Step
                      {...this.props}
                      theme={this.context.theme}
                      do={this.doProxy}
                      setForm={this.setForm}
                    />
                  ))}
                />
              </Container>
            );
          }

          default: {
            return (
              <Container
                kind="view"
                width={this.props.dialog.get('containerWidth') || '800px'}
                spacing="large"
              >
                <Container kind="pane-header">
                  <Label text={title} kind="pane-header" />
                </Container>
                <Container kind="pane-wizard">
                  <Form
                    {...this.formConfigWithComponent(() => (
                      <Step
                        {...this.props}
                        theme={this.context.theme}
                        do={this.doProxy}
                        setForm={this.setForm}
                      />
                    ))}
                  />
                </Container>
                {this.renderButtons('actions')}
              </Container>
            );
          }
        }
      }
    }
  }
}

export default Wizard;
