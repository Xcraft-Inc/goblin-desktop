import React from 'react';
import Form from 'laboratory/form';
import Container from 'gadgets/container/widget';
import Button from 'gadgets/button/widget';
import PropTypes from 'prop-types';
/******************************************************************************/

class Workitem extends Form {
  constructor () {
    super (...arguments);
    this.onSubmit = this.onSubmit.bind (this);
    this.onCancel = this.onCancel.bind (this);
    this.onEdit = this.onEdit.bind (this);
    this.onDelete = this.onDelete.bind (this);
  }

  getChildContext () {
    return {
      readonly: this.props.readonly,
    };
  }

  static get childContextTypes () {
    return {
      readonly: PropTypes.any,
    };
  }

  onSubmit () {
    const service = this.props.id.split ('@')[0];
    this.doAs (service, 'version');
    this.doAs (service, 'close', {kind: 'validate'});
  }

  onCancel () {
    const service = this.props.id.split ('@')[0];
    this.doAs (service, 'close', {kind: 'cancel'});
  }

  onEdit () {
    const entity = this.getEntityById (this.props.entityId).toJS ();
    const service = this.props.id.split ('@')[0];
    this.doAs (service, 'edit', {entity});
  }

  onDelete () {
    const service = this.props.id.split ('@')[0];
    this.doAs (service, 'delete', {hard: true});
  }

  /******************************************************************************/

  renderDetailActions () {
    return (
      <Container kind="actions">
        <Button
          width="0px"
          grow="1"
          kind="action"
          glyph="pencil"
          text="Editer"
          place="1/2"
          onClick={this.onEdit}
        />
        <Button
          width="0px"
          grow="0.5"
          kind="action"
          glyph="trash"
          text="Supprimer"
          place="2/2"
          onClick={this.onDelete}
        />
      </Container>
    );
  }

  renderEditorActions () {
    return (
      <Container kind="actions">
        <Button
          width="0px"
          grow="1"
          kind="action"
          glyph="check"
          text="Terminer"
          place="1/3"
          onClick={this.onSubmit}
        />
        <Button
          width="0px"
          grow="1"
          kind="action"
          place="3/3"
          glyph="close"
          text="Annuler"
          onClick={this.onCancel}
        />
      </Container>
    );
  }

  renderEditor () {
    const Form = this.Form;
    return (
      <Container
        kind="view"
        width={this.props.width || '700px'}
        spacing="large"
      >
        <Container kind="pane-header">
          {this.props.title}
          {this.props.version}
        </Container>
        <Container kind="panes">
          <Form validateOn="submit" model={`backend.${this.props.entityId}`}>
            {this.props.children}
          </Form>
        </Container>
        {this.renderEditorActions ()}
      </Container>
    );
  }

  renderDetail () {
    const Form = this.Form;
    return (
      <Container kind="column-full">
        <Container kind="pane-header">
          {this.props.title}
        </Container>
        <Container kind="panes">
          <Form validateOn="submit" model={`backend.${this.props.entityId}`}>
            {this.props.children}
          </Form>
        </Container>
        {this.renderDetailActions ()}
      </Container>
    );
  }

  renderForm () {
    const Form = this.Form;
    return (
      <Form validateOn="submit" model={`backend.${this.props.entityId}`}>
        {this.props.children}
      </Form>
    );
  }

  render () {
    if (!this.props.id) {
      return <div>missing id props on Workitem component</div>;
    }
    if (!this.props.entityId) {
      return <div>missing entityId props on Workitem component</div>;
    }

    const kind = this.props.kind || 'editor';
    switch (kind) {
      case 'editor':
        return this.renderEditor ();
      case 'detail':
        return this.renderDetail ();
      case 'form':
        return this.renderForm ();
      default:
        return null;
    }
  }
}

/******************************************************************************/
export default Workitem;
