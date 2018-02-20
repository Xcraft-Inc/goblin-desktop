import React from 'react';
import Form from 'laboratory/form';
import Container from 'gadgets/container/widget';
import Label from 'gadgets/label/widget';
import Button from 'gadgets/button/widget';
import importer from 'laboratory/importer/';

const uiImporter = importer('ui');
class Wizard extends Form {
  constructor() {
    super(...arguments);
    this.onNext = this.onNext.bind(this);
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

  doProxy(action, args) {
    const workitem = this.props.id.split('@')[0];
    this.doAs(workitem, action, args);
  }

  render() {
    const {id, title} = this.props;
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

export default Wizard;
