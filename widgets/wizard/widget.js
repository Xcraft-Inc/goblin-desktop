import React from 'react';
import Form from 'laboratory/form';
import Widget from 'laboratory/widget';
import Container from 'gadgets/container/widget';
import Label from 'gadgets/label/widget';
import importer from 'goblin_importer';
import PropTypes from 'prop-types';

import DialogModal from 'gadgets/dialog-modal/widget';
import Separator from 'gadgets/separator/widget';
import WizardButtons from '../wizard-buttons/widget';

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
    };
  }

  getChildContext() {
    return {
      readonly: this.props.readonly,
      id: this.props.id,
      entityId: this.props.entityId,
      dragServiceId: this.props.dragServiceId,
    };
  }

  static get childContextTypes() {
    return {
      readonly: PropTypes.any,
      id: PropTypes.string,

      entityId: PropTypes.string,
      dragServiceId: PropTypes.string,
    };
  }

  onNext() {
    const service = this.props.id.split('@')[0];
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

  render() {
    const {id, dialog, title, kind} = this.props;
    if (!id || !dialog) {
      return null;
    }
    let Step = null;
    const wizard = this.props.id.split('@')[0];
    const wizardUI = uiImporter(wizard);

    const hasStep = !!wizardUI[this.props.step];
    if (!hasStep) {
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
    const mode = dialog.get('mode');
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
                <WizardButtons
                  id={this.props.id}
                  containerKind="row"
                  onNext={this.onNext}
                  onCancel={this.onCancel}
                />
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
                horizontalSpacing="large"
              >
                <Form
                  {...this.formConfigWithComponent(
                    React.forwardRef(
                      (props, ref) =>
                        hasStep && (
                          <Step
                            ref={ref}
                            {...this.props}
                            theme={this.context.theme}
                            do={this.doProxy}
                            setForm={this.setForm}
                          />
                        )
                    )
                  )}
                />
              </Container>
            );
          }

          default: {
            return (
              <Container
                kind="view"
                width={this.props.dialog.get('containerWidth') || '800px'}
                horizontalSpacing="large"
              >
                <Container kind="pane-header">
                  <Label text={title} kind="pane-header" />
                </Container>
                <Container kind="pane-wizard">
                  <Form
                    {...this.formConfigWithComponent(
                      React.forwardRef(
                        (props, ref) =>
                          hasStep && (
                            <Step
                              ref={ref}
                              {...this.props}
                              theme={this.context.theme}
                              do={this.doProxy}
                              setForm={this.setForm}
                            />
                          )
                      )
                    )}
                  />
                </Container>
                <WizardButtons
                  id={this.props.id}
                  containerKind="actions"
                  onNext={this.onNext}
                  onCancel={this.onCancel}
                />
              </Container>
            );
          }
        }
      }
    }
  }
}

export default Widget.Wired(Wizard)();
