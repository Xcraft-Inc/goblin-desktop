//T:2019-02-27

import React from 'react';
import Widget from 'goblin-laboratory/widgets/widget';
import Form from 'goblin-laboratory/widgets/form';
import WorkitemFields from '../workitem-fields/widget.js';
import PropTypes from 'prop-types';

import Container from 'goblin-gadgets/widgets/container/widget';
import Label from 'goblin-gadgets/widgets/label/widget';
import Button from 'goblin-gadgets/widgets/button/widget';
import ScrollableContainer from 'goblin-gadgets/widgets/scrollable-container/widget';
import T from 't';

/******************************************************************************/

class Workitem extends Form {
  constructor() {
    super(...arguments);
    this.doAction = this.doAction.bind(this);
    this.onSubmit = this.onSubmit.bind(this);
    this.onCancel = this.onCancel.bind(this);
    this.onClose = this.onClose.bind(this);
    this.onEdit = this.onEdit.bind(this);
    this.onTrash = this.onTrash.bind(this);
    this.onArchive = this.onArchive.bind(this);
    this.onPublish = this.onPublish.bind(this);
    this.onCopyInfoToClipboard = this.onCopyInfoToClipboard.bind(this);
    this.editSettings = this.editSettings.bind(this);
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

  onCancel() {
    this.doAs(this.service, 'restore-entity');
    this.hideHinter();
  }

  onClose() {
    const kind = this.props.kind || 'editor';
    switch (kind) {
      case 'editor':
        this.doAs(this.service, 'close', {
          kind: 'terminate',
          desktopId: this.desktopId,
          contextId: this.contextId,
        });
        break;
      default:
        this.doAs(this.service, 'hide');
    }
  }

  onEdit() {
    const entity = this.getEntityById(this.props.entityId);
    if (entity) {
      this.doAs(this.service, 'edit', {
        entity,
        desktopId: this.desktopId,
      });
    }
  }

  doAction(action) {
    const kind = this.props.kind || 'editor';
    switch (kind) {
      case 'editor':
        this.doAs(this.service, 'close', {
          kind: action,
          desktopId: this.desktopId,
          contextId: this.contextId,
        });
        break;
      default:
        this.doAs(this.service, `${action}-entity`);
    }
  }

  onPublish() {
    this.doAction('publish');
  }

  onTrash() {
    this.doAction('trash');
  }

  onArchive() {
    this.doAction('archive');
  }

  onCopyInfoToClipboard() {
    Form.copyTextToClipboard(this.props.entityId);

    this.doAs(this.service, 'add-state-monitor', {
      key: this.props.entityId,
    });
  }

  editSettings() {
    this.doAs(this.service, 'open-entity-workitem', {
      entityId: `workitem@${this.props.id.split('@')[0]}`,
    });
  }

  /******************************************************************************/

  handleOnClick(button) {
    switch (button.id) {
      case 'validate':
        this.onSubmit();
        break;
      case 'publish':
        this.onPublish();
        break;
      case 'edit':
        this.onEdit();
        break;
      case 'reset':
        this.onCancel();
        break;
      case 'archive':
        this.onArchive();
        break;
      case 'trash':
        this.onTrash();
        break;
      default:
        break;
    }

    if (button.quest) {
      if (button.questService) {
        this.doFor(button.questService, button.quest, button.questParams);
      } else {
        this.doAs(this.service, button.quest, button.questParams);
      }
    }
  }

  renderActionButton(button, layout, index, count) {
    return (
      <Button
        key={index}
        kind={layout === 'secondary' ? 'secondary-action' : 'action'}
        width={layout === 'secondary' ? null : '0px'}
        grow={layout === 'secondary' ? null : '1'}
        place={`${index + 1}/${count}`}
        onClick={() => this.handleOnClick(button)}
        {...button}
      />
    );
  }

  renderActionButtonsList(buttons, layout) {
    const count = buttons.size;
    return buttons.map((button, index) =>
      this.renderActionButton(button.toJS(), layout, index, count)
    );
  }

  renderActionButtons() {
    if (!this.props.buttons) {
      return null;
    }

    const primaryButtons = this.props.buttons.filter((b) => {
      const layout = b.get('layout');
      return !layout || layout === 'primary';
    });
    const secondaryButtons = this.props.buttons.filter(
      (b) => b.get('layout') === 'secondary'
    );

    if (secondaryButtons.size > 0) {
      return (
        <Container kind="actions-lines">
          <Container kind="actions-line-secondary">
            {this.renderActionButtonsList(secondaryButtons, 'secondary')}
          </Container>
          <Container kind="actions-line-primary">
            {this.renderActionButtonsList(primaryButtons, 'primary')}
          </Container>
        </Container>
      );
    } else {
      return (
        <Container kind="actions">
          {this.renderActionButtonsList(primaryButtons, 'primary')}
        </Container>
      );
    }
  }

  renderStatusBase() {
    if (this.props.status === 'draft') {
      return (
        <div className={this.styles.classNames.statusDraft}>
          <Label kind="pane-warning" text={T('Brouillon')} />
        </div>
      );
    } else if (this.props.status === 'archived') {
      return (
        <div className={this.styles.classNames.statusArchived}>
          <Label kind="pane-warning" text={T('Archivé')} />
        </div>
      );
    } else if (this.props.status === 'trashed') {
      return (
        <div className={this.styles.classNames.statusTrashed}>
          <Label kind="pane-warning" text={T('Détruit')} />
        </div>
      );
    } else if (this.props.status === 'missing') {
      return (
        <div className={this.styles.classNames.statusTrashed}>
          <Label kind="pane-warning" text={T('Manquant')} />
        </div>
      );
    } else {
      return null;
    }
  }

  renderStatusBusiness() {
    if (this.props.businessStatus) {
      return (
        <div className={this.styles.classNames.statusBusiness}>
          <Label kind="pane-warning" text={this.props.businessStatus} />
        </div>
      );
    } else {
      return null;
    }
  }

  renderStatusTopButtons() {
    return (
      <div className={this.styles.classNames.topButtons}>
        <Button
          kind="pane-warning"
          glyph="solid/times"
          tooltip={T('Fermer')}
          onClick={this.onClose}
        />
      </div>
    );
  }

  renderStatusButtons() {
    if (document.queryCommandSupported('copy')) {
      return (
        <div className={this.styles.classNames.statusButtons}>
          <Button
            kind="pane-warning"
            glyph="light/radar"
            tooltip={T('Voir dans le State Monitor')}
            onClick={this.onCopyInfoToClipboard}
          />
          <Button
            kind="pane-warning"
            glyph="solid/edit"
            tooltip={T('Editer les champs additionnels')}
            onClick={this.editSettings}
          />
        </div>
      );
    } else {
      return (
        <div className={this.styles.classNames.statusButtons}>
          <Button
            kind="pane-warning"
            glyph="solid/edit"
            tooltip={T('Editer')}
            onClick={this.editSettings}
          />
        </div>
      );
    }
  }

  renderStatus() {
    return (
      <div className={this.styles.classNames.status}>
        {this.renderStatusTopButtons()}
        {this.renderStatusBase()}
        {this.renderStatusBusiness()}
        {this.renderStatusButtons()}
      </div>
    );
  }

  renderEditor() {
    const Form = this.Form;

    const Title = this.mapWidget(
      Label,
      'text',
      `backend.${this.props.entityId}.meta.summaries.info`
    );

    const scrollableId = `workitem-edit@${this.props.entityId || 'generic'}`;

    return (
      <Container
        kind="view"
        width={this.props.width || '700px'}
        horizontalSpacing="large"
      >
        <Container kind="pane-header">
          <Title kind="pane-header" singleLine={true} wrap="no" />
          {this.props.version}
        </Container>
        {this.renderStatus()}
        <ScrollableContainer
          kind="panes"
          id={scrollableId}
          restoreScroll={true}
        >
          <Form
            component={FormComponent}
            validateOn="submit"
            model={`backend.${this.props.entityId}`}
          >
            {this.props.children}
            <WorkitemFields
              id={`workitem@${this.props.id.split('@')[0]}`}
              workitemId={this.props.id}
              readonly={false}
            />
          </Form>
        </ScrollableContainer>
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

    const scrollableId = `workitem-readonly@${
      this.props.entityId || 'generic'
    }`;

    return (
      <Container kind="column-full">
        <Container kind="pane-header">
          <Title kind="pane-header" singleLine={true} wrap="no" />
        </Container>
        {this.renderStatus()}
        <ScrollableContainer
          kind="panes"
          id={scrollableId}
          restoreScroll={true}
        >
          <Form
            component={FormComponent}
            validateOn="submit"
            model={`backend.${this.props.entityId}`}
          >
            {this.props.children}
            <WorkitemFields
              id={`workitem@${this.props.id.split('@')[0]}`}
              workitemId={this.props.id}
              readonly={true}
            />
          </Form>
        </ScrollableContainer>
        {this.renderActionButtons()}
      </Container>
    );
  }

  renderDocument() {
    const Form = this.Form;
    const Title = this.mapWidget(
      Label,
      'text',
      `backend.${this.props.entityId}.meta.summaries.info`
    );
    return (
      <Container kind="column-full">
        <Container kind="pane-header">
          <Title kind="pane-header" singleLine={true} wrap="no" />
        </Container>
        {this.renderStatus()}
        <Form
          component={FormFragmentComponent}
          validateOn="submit"
          model={`backend.${this.props.entityId}`}
        >
          {this.props.children}
        </Form>

        {this.renderActionButtons()}
      </Container>
    );
  }

  renderForm() {
    const Form = this.Form;
    const formClass = this.styles.classNames.form;
    return (
      <Form
        component={FormComponent}
        formClass={formClass}
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
        component={FormComponent}
        formClass={boardClass}
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
        component={FormComponent}
        formClass={roadbookClass}
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
        component={FormComponent}
        formClass={deskClass}
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
      case 'document':
        return this.renderDocument();
      default:
        console.error(`Workitem does not support kind='${kind}'`);
        return null;
    }
  }
}

/******************************************************************************/
export default Widget.connect((state, props) => {
  if (props.entityId) {
    return {
      status: state.get(`backend.${props.entityId}.meta.status`),
      businessStatus: state.get(`backend.${props.entityId}.status`),
      entityType: state.get(`backend.${props.entityId}.meta.type`),
    };
  } else {
    return {
      status: null,
      businessStatus: null,
      entityType: null,
    };
  }
})(Workitem);

class FormComponent extends React.PureComponent {
  render() {
    const {formClass} = this.props;
    return <div className={formClass}>{this.props.children}</div>;
  }
}

class FormFragmentComponent extends React.PureComponent {
  render() {
    return <React.Fragment>{this.props.children}</React.Fragment>;
  }
}
