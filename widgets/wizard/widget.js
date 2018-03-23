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
  }

  static get wiring() {
    return {
      id: 'id',
      title: 'title',
      step: 'step',
      busy: 'busy',
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
    }

    const Form = this.Form;

    //???? width={this.props.dialog.width}
    //???? height={this.props.dialog.height}
    //???? zIndex={this.props.dialog.zIndex}
    if (kind === 'dialog') {
      return (
        <DialogModal width="500px" zIndex="12">
          <Form {...this.formConfig}>
            <Step
              {...this.props}
              theme={this.context.theme}
              do={this.doProxy}
              setForm={this.setForm}
            />
          </Form>
          <Separator kind="space" height="20px" />
          <Container kind="row">
            <Button
              busy={this.props.busy}
              width="0px"
              grow="1"
              kind="action"
              place="1/2"
              glyph="solid/step-forward"
              text="Suivant"
              onClick={this.onNext}
            />
            <Button
              glyph="solid/times"
              text="Annuler"
              grow="1"
              kind="action"
              place="2/2"
              onClick={this.onCancel}
            />
          </Container>
        </DialogModal>
      );
    } else {
      return (
        <Container kind="view" width="800px" spacing="large">
          <Container kind="pane-header">
            <Label text={title} kind="pane-header" />
          </Container>
          <Container kind="panes">
            <Container kind="pane">
              <Form {...this.formConfig}>
                <Step
                  {...this.props}
                  theme={this.context.theme}
                  do={this.doProxy}
                  setForm={this.setForm}
                />
              </Form>
            </Container>
          </Container>
          <Container kind="actions">
            <Button
              busy={this.props.busy}
              width="0px"
              grow="1"
              kind="action"
              place="1/1"
              glyph="solid/step-forward"
              text="Suivant"
              onClick={this.onNext}
            />
          </Container>
        </Container>
      );
    }
  }
}

export default Wizard;
