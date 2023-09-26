import React from 'react';
import Form from 'goblin-laboratory/widgets/form';
import Widget from 'goblin-laboratory/widgets/widget';
import Container from 'goblin-gadgets/widgets/container/widget';
import Label from 'goblin-gadgets/widgets/label/widget';
import importer from 'goblin_importer';
import PropTypes from 'prop-types';

import DialogModal from 'goblin-gadgets/widgets/dialog-modal/widget';
import Separator from 'goblin-gadgets/widgets/separator/widget';
import WizardButtons from '../wizard-buttons/widget';
import stateMapperToProps from 'goblin-laboratory/widgets/state-mapper-to-props/widget';

const uiImporter = importer('ui');

/******************************************************************************/

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

  /******************************************************************************/

  renderDialogCustom(Step) {
    const Form = this.Form;

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
  }

  renderDialogSimple(Step) {
    const Form = this.Form;

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
  }

  renderDialogDefault(Step) {
    const Form = this.Form;

    return (
      <DialogModal
        resizable={this.props.dialog.get('resizable')}
        id={this.props.dialog.get('id')}
        title={this.props.dialog.get('title')}
        width={this.props.dialog.get('width')}
        height={this.props.dialog.get('height')}
        minWidth={this.props.dialog.get('minWidth')}
        minHeight={this.props.dialog.get('minHeight')}
        zIndex={this.props.dialog.get('zIndex')}
        close={this.onCancel}
      >
        <Form {...this.formConfigWithoutStyle}>
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

  renderSimple(Step, hasStep) {
    const Form = this.Form;

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

  renderFull(Step, hasStep) {
    const Form = this.Form;

    return (
      <Container kind="views">
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

  renderDefault(Step, hasStep) {
    const Form = this.Form;

    return (
      <Container
        kind="view"
        width={this.props.dialog.get('containerWidth') || '800px'}
        horizontalSpacing="large"
      >
        <Container kind="pane-header">
          <Label text={this.props.title} kind="pane-header" />
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

  render() {
    const {id, dialog, kind} = this.props;
    if (!id || !dialog) {
      return null;
    }

    let Step = null;
    const wizard = this.props.id.split('@')[0];
    const wizardUI = uiImporter(wizard);

    const hasStep = !!wizardUI[this.props.step];
    if (!hasStep) {
      Step = (props) => {
        return null;
      };
    } else {
      const mapper = wizardUI.mappers && wizardUI.mappers[this.props.step];
      Step = stateMapperToProps(
        wizardUI[this.props.step],
        mapper,
        `backend.${this.props.id}`
      );
    }

    const mode = dialog.get('mode');
    switch (kind) {
      case 'dialog': {
        switch (mode) {
          case 'custom':
            return this.renderDialogCustom(Step);
          case 'simple':
            return this.renderDialogSimple(Step);
          default:
            return this.renderDialogDefault(Step);
        }
      }

      default: {
        switch (mode) {
          case 'simple':
            return this.renderSimple(Step, hasStep);
          case 'full':
            return this.renderFull(Step, hasStep);
          default:
            return this.renderDefault(Step, hasStep);
        }
      }
    }
  }
}

/******************************************************************************/

export default Widget.Wired(Wizard);
