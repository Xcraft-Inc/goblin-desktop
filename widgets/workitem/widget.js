import React from 'react';
import Form from 'laboratory/form';
import Container from 'gadgets/container/widget';
import Label from 'gadgets/label/widget';
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
    this.onArchive = this.onArchive.bind (this);
    this.onPublish = this.onPublish.bind (this);
  }

  getChildContext () {
    return {
      readonly: this.props.readonly,
      id: this.props.id,
      entityId: this.props.entityId,
      dragServiceId: this.props.dragServiceId,
    };
  }

  static get childContextTypes () {
    return {
      readonly: PropTypes.any,
      id: PropTypes.string,
      entityId: PropTypes.string,
      dragServiceId: PropTypes.string,
    };
  }

  get service () {
    return this.props.id.split ('@')[0];
  }

  get desktopId () {
    return this.context.desktopId;
  }

  get contextId () {
    return this.context.contextId;
  }

  onSubmit () {
    this.doAs (this.service, 'close', {
      kind: 'validate',
      desktopId: this.desktopId,
      contextId: this.contextId,
    });
  }

  onCancel () {
    this.doAs (this.service, 'close', {
      kind: 'cancel',
      desktopId: this.desktopId,
      contextId: this.contextId,
    });
  }

  onEdit () {
    const e = this.getEntityById (this.props.entityId);
    if (e) {
      const entity = e.toJS ();
      this.doAs (this.service, 'edit', {entity, desktopId: this.desktopId});
    }
  }

  onDelete () {
    this.doAs (this.service, 'delete-entity');
    this.hideHinter ();
  }

  onPublish () {
    this.doAs (this.service, 'publish-entity');
    this.hideHinter ();
  }

  onArchive () {
    this.doAs (this.service, 'archive-entity');
    this.hideHinter ();
  }

  /******************************************************************************/

  renderDetailActions () {
    switch (this.props.status) {
      case 'draft':
      case 'archived':
        return (
          <Container kind="actions">
            <Button
              width="0px"
              grow="1"
              kind="action"
              glyph="solid/pencil"
              text="Editer"
              place="1/2"
              onClick={this.onEdit}
            />
            <Button
              width="0px"
              grow="0.5"
              kind="action"
              glyph="solid/check"
              text="Publier"
              place="2/2"
              onClick={this.onPublish}
            />
          </Container>
        );
      case 'published':
        return (
          <Container kind="actions">
            <Button
              width="0px"
              grow="1"
              kind="action"
              glyph="solid/pencil"
              text="Editer"
              place="1/2"
              onClick={this.onEdit}
            />
            <Button
              width="0px"
              grow="0.5"
              kind="action"
              glyph="solid/archive"
              text="Archiver"
              place="2/2"
              onClick={this.onArchive}
            />
          </Container>
        );
    }
  }

  renderEditorActions () {
    switch (this.props.status) {
      case 'archived':
      case 'draft':
        return (
          <Container kind="actions">
            <Button
              width="0px"
              grow="1"
              kind="action"
              glyph="solid/check"
              text="Publier"
              place="1/2"
              onClick={this.onPublish}
            />
            <Button
              width="0px"
              grow="1"
              kind="action"
              place="2/2"
              glyph="solid/ban"
              text="Annuler"
              onClick={this.onCancel}
            />
          </Container>
        );
      case 'published':
        return (
          <Container kind="actions">
            <Button
              width="0px"
              grow="1"
              kind="action"
              glyph="solid/check"
              text="Terminer"
              place="1/2"
              onClick={this.onSubmit}
            />
            <Button
              width="0px"
              grow="1"
              kind="action"
              place="2/2"
              glyph="solid/ban"
              text="Annuler"
              onClick={this.onCancel}
            />
          </Container>
        );
    }
  }

  renderEditor () {
    const Form = this.Form;

    const Title = this.mapWidget (
      Label,
      'text',
      `backend.${this.props.entityId}.meta.summaries.info`
    );

    return (
      <Container
        kind="view"
        width={this.props.width || '700px'}
        spacing="large"
      >
        <Container kind="pane-header">
          <Title kind="pane-header" singleLine="true" wrap="no" />
          {this.props.version}
        </Container>
        <Container kind="panes">
          <Form
            component="div"
            validateOn="submit"
            model={`backend.${this.props.entityId}`}
          >
            {this.props.children}
          </Form>
        </Container>
        {this.renderEditorActions ()}
      </Container>
    );
  }

  renderDetail () {
    const Form = this.Form;

    const Title = this.mapWidget (
      Label,
      'text',
      `backend.${this.props.entityId}.meta.summaries.info`
    );

    return (
      <Container kind="column-full">
        <Container kind="pane-header">
          <Title kind="pane-header" singleLine="true" wrap="no" />
        </Container>
        <Container kind="panes">
          <Form
            component="div"
            validateOn="submit"
            model={`backend.${this.props.entityId}`}
          >
            {this.props.children}
          </Form>
        </Container>
        {this.renderDetailActions ()}
      </Container>
    );
  }

  renderForm () {
    const Form = this.Form;
    const formClass = this.styles.classNames.form;
    return (
      <Form
        component={props => {
          return <div className={formClass}>{this.props.children}</div>;
        }}
        validateOn="submit"
        model={`backend.${this.props.entityId}`}
      >
        {this.props.children}
      </Form>
    );
  }

  renderBoard () {
    const Form = this.Form;
    const boardClass = this.styles.classNames.board;
    return (
      <Form
        component={props => {
          return <div className={boardClass}>{this.props.children}</div>;
        }}
        validateOn="submit"
        model={`backend.${this.props.entityId}`}
      >
        {this.props.children}
      </Form>
    );
  }

  renderRoadbook () {
    const Form = this.Form;
    const roadbookClass = this.styles.classNames.roadbook;
    return (
      <Form
        component={props => {
          return <div className={roadbookClass}>{this.props.children}</div>;
        }}
        validateOn="submit"
        model={`backend.${this.props.entityId}`}
      >
        {this.props.children}
      </Form>
    );
  }

  renderDesk () {
    const Form = this.Form;
    const deskClass = this.styles.classNames.desk;
    return (
      <Form
        component={props => {
          return <div className={deskClass}>{this.props.children}</div>;
        }}
        validateOn="submit"
        model={`backend.${this.props.entityId}`}
      >
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
      case 'board':
        return this.renderBoard ();
      case 'roadbook':
        return this.renderRoadbook ();
      case 'desk':
        return this.renderDesk ();
      default:
        console.error (`Workitem does not support kind='${kind}'`);
        return null;
    }
  }
}

/******************************************************************************/
export default Workitem;
