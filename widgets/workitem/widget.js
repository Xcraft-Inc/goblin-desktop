import React from 'react';
import Form from 'laboratory/form';
import Container from 'gadgets/container/widget';
import Label from 'gadgets/label/widget';
import Button from 'gadgets/button/widget';
import PropTypes from 'prop-types';

/******************************************************************************/

class Workitem extends Form {
  constructor() {
    super(...arguments);
    this.onSubmit = this.onSubmit.bind(this);
    this.onCancel = this.onCancel.bind(this);
    this.onEdit = this.onEdit.bind(this);
    this.onDelete = this.onDelete.bind(this);
    this.onArchive = this.onArchive.bind(this);
    this.onPublish = this.onPublish.bind(this);
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

  get service() {
    return this.props.id.split('@')[0];
  }

  get desktopId() {
    return this.context.desktopId;
  }

  get contextId() {
    return this.context.contextId;
  }

  onSubmit() {
    this.doAs(this.service, 'close', {
      kind: 'validate',
      desktopId: this.desktopId,
      contextId: this.contextId,
    });
  }

  onPublish() {
    this.doAs(this.service, 'close', {
      kind: 'publish',
      desktopId: this.desktopId,
      contextId: this.contextId,
    });
  }

  onCancel() {
    this.doAs(this.service, 'restore-entity');
    this.hideHinter();
  }

  onEdit() {
    const entity = this.getEntityById(this.props.entityId);
    if (entity) {
      this.doAs(this.service, 'edit', {entity, desktopId: this.desktopId});
    }
  }

  onDelete() {
    this.doAs(this.service, 'delete-entity');
    this.hideHinter();
  }

  onArchive() {
    this.doAs(this.service, 'archive-entity');
    this.hideHinter();
  }

  /******************************************************************************/

  renderDetailActions() {
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

  renderActionButton(button, index, count) {
    return (
      <Button
        key={index}
        kind="action"
        width="0px"
        grow={button.get('grow') || '1'}
        glyph={button.get('glyph')}
        text={button.get('text')}
        place={`${index + 1}/${count}`}
        disabled={button.get('disabled')}
        onClick={button.get('action')}
      />
    );
  }

  renderActionButtonsList() {
    const result = [];
    if (this.props.buttons) {
      //? const buttons = Object.values(this.props.buttons);
      const buttons = this.props.buttons.toArray();
      let index = 0;
      const count = buttons.length;
      for (const button of buttons) {
        result.push(this.renderActionButton(button, index++, count));
      }
    }
    return result;
  }

  renderActionButtons() {
    return (
      <Container kind="actions">{this.renderActionButtonsList()}</Container>
    );
  }

  renderEditorActions() {
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
              {...this.props.mainButton}
            />
            <Button
              width="0px"
              grow="1"
              kind="action"
              place="2/2"
              glyph="solid/undo"
              text="Réinitialiser"
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
              place="1/3"
              onClick={this.onSubmit}
              {...this.props.mainButton}
            />
            <Button
              width="0px"
              grow="1"
              kind="action"
              place="2/3"
              glyph="solid/undo"
              text="Réinitialiser"
              onClick={this.onCancel}
            />
            <Button
              width="0px"
              grow="1"
              kind="action"
              glyph="solid/archive"
              text="Archiver"
              place="3/3"
              onClick={this.onArchive}
            />
          </Container>
        );
    }
  }

  renderStatus() {
    if (this.props.status === 'draft') {
      return (
        <Container kind="pane-warning" subkind="draft">
          <Label kind="pane-warning" text="Brouillon" />
        </Container>
      );
    } else if (this.props.status === 'archived') {
      return (
        <Container kind="pane-warning" subkind="archived">
          <Label kind="pane-warning" text="Archivé" />
        </Container>
      );
    } else {
      return null;
    }
  }

  renderEditor() {
    const Form = this.Form;

    const Title = this.mapWidget(
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
        {this.renderStatus()}
        <Container kind="panes">
          <Form
            component="div"
            validateOn="submit"
            model={`backend.${this.props.entityId}`}
          >
            {this.props.children}
          </Form>
        </Container>
        {this.renderActionButtons()}
      </Container>
    );
  }

  renderDetail() {
    const Form = this.Form;

    const Title = this.mapWidget(
      Label,
      'text',
      `backend.${this.props.entityId}.meta.summaries.info`
    );

    return (
      <Container kind="column-full">
        <Container kind="pane-header">
          <Title kind="pane-header" singleLine="true" wrap="no" />
        </Container>
        {this.renderStatus()}
        <Container kind="panes">
          <Form
            component="div"
            validateOn="submit"
            model={`backend.${this.props.entityId}`}
          >
            {this.props.children}
          </Form>
        </Container>
        {this.renderActionButtons()}
      </Container>
    );
  }

  renderForm() {
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

  renderBoard() {
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

  renderRoadbook() {
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

  renderDesk() {
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

  render() {
    if (!this.props.id) {
      return <div>missing id props on Workitem component</div>;
    }
    if (!this.props.entityId) {
      return <div>missing entityId props on Workitem component</div>;
    }

    const kind = this.props.kind || 'editor';
    switch (kind) {
      case 'editor':
        return this.renderEditor();
      case 'detail':
        return this.renderDetail();
      case 'form':
        return this.renderForm();
      case 'map':
      case 'board':
        return this.renderBoard();
      case 'roadbook':
        return this.renderRoadbook();
      case 'desk':
        return this.renderDesk();
      default:
        console.error(`Workitem does not support kind='${kind}'`);
        return null;
    }
  }
}

/******************************************************************************/
export default Workitem;
