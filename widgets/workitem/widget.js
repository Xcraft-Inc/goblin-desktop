import React from 'react';
import Widget from 'goblin-laboratory/widgets/widget';
import Form from 'goblin-laboratory/widgets/form';
import WorkitemFields from '../workitem-fields/widget.js';
import PropTypes from 'prop-types';

import Container from 'goblin-gadgets/widgets/container/widget';
import Label from 'goblin-gadgets/widgets/label/widget';
import Button from 'goblin-gadgets/widgets/button/widget';
import ScrollableContainer from 'goblin-gadgets/widgets/scrollable-container/widget';
import DialogModal from 'goblin-gadgets/widgets/dialog-modal/widget';
import CheckList from 'goblin-gadgets/widgets/check-list/widget';
import EntityAlerts from 'goblin-desktop/widgets/entity-alerts/widget.js';
import T from 't';

/******************************************************************************/

class Workitem extends Form {
  constructor() {
    super(...arguments);

    this.state = {
      showDeleteDialog: false,
      deleteAction: 'archive',
      showStatureSmall: false,
    };

    this.doAction = this.doAction.bind(this);
    this.onSubmit = this.onSubmit.bind(this);
    this.onCancel = this.onCancel.bind(this);
    this.onClose = this.onClose.bind(this);
    this.onEdit = this.onEdit.bind(this);
    this.onTrash = this.onTrash.bind(this);
    this.onDelete = this.onDelete.bind(this);
    this.onDoDelete = this.onDoDelete.bind(this);
    this.onArchive = this.onArchive.bind(this);
    this.onPublish = this.onPublish.bind(this);
    this.onCopyInfoToClipboard = this.onCopyInfoToClipboard.bind(this);
    this.editSettings = this.editSettings.bind(this);
    this.hide = this.hide.bind(this);
  }

  //#region get/set
  get showDeleteDialog() {
    return this.state.showDeleteDialog;
  }
  set showDeleteDialog(value) {
    this.setState({
      showDeleteDialog: value,
    });
  }

  get deleteAction() {
    return this.state.deleteAction;
  }
  set deleteAction(value) {
    this.setState({
      deleteAction: value,
    });
  }

  get showStatureSmall() {
    return this.state.showStatureSmall;
  }
  set showStatureSmall(value) {
    this.setState({
      showStatureSmall: value,
    });
  }
  //#endregion

  componentDidMount() {
    // FIXME: stacked workitems not handled properly
    // MouseTrap.bind('esc', this.onClose);
  }

  componentWillUnmount() {
    super.componentWillUnmount();
    // MouseTrap.unbind('esc');
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
    });
  }

  onCancel() {
    this.doAs(this.service, 'restore-entity');
    //TODO-VNEXT: REPAIR ME
    //this.hideHinter();
  }

  onClose() {
    const kind = this.props.kind || 'editor';
    switch (kind) {
      case 'editor':
        this.doAs(this.service, 'close', {
          kind: 'terminate',
          desktopId: this.desktopId,
        });
        break;
      default:
        this.hide();
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

  hide() {
    this.doAs(this.service, 'hide');

    //in case of use in a search list,
    //dispatch to search list a null rowId
    if (
      this.props.leftPanelWorkitemId &&
      this.props.leftPanelWorkitemId.match(/^.*-search@.*/)
    ) {
      this.dispatchTo(
        this.props.leftPanelWorkitemId,
        {type: 'select-row', rowId: null, entityId: null},
        'entity-view'
      );
    }
  }

  doAction(action) {
    const kind = this.props.kind || 'editor';
    switch (kind) {
      case 'editor':
        this.doAs(this.service, 'close', {
          kind: action,
          desktopId: this.desktopId,
        });
        break;
      default:
        this.doAs(this.service, `${action}-entity`);
    }
  }

  onPublish() {
    this.doAction('publish');
  }

  onDelete() {
    this.deleteAction = 'archive';
    this.showDeleteDialog = true;
  }

  onDoDelete() {
    this.showDeleteDialog = false;
    if (this.deleteAction === 'trash') {
      this.onTrash();
    } else {
      this.onArchive();
    }
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
      case 'delete':
        this.onDelete();
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

  renderActionListButton(button, hasStature, index) {
    return (
      <div
        key={index}
        className={
          hasStature
            ? this.styles.classNames.actionListWithStature
            : this.styles.classNames.actionList
        }
      >
        <Button
          kind="secondary-action"
          grow="1"
          place="1/1"
          onClick={() => this.handleOnClick(button)}
          {...button}
        />
      </div>
    );
  }

  renderActionListButtonsGroup(list, index) {
    const name = list.get(0).get('statureGroupName');

    return (
      <div key={index} className={this.styles.classNames.actionsListSmall}>
        <div className={this.styles.classNames.actionsListSmallTitle}>
          <Label
            textTransform="uppercase"
            fontSize="75%"
            fontWeight="bold"
            text={name}
          />
        </div>
        <div
          key={index}
          className={this.styles.classNames.actionsListSmallContent}
        >
          {list.map((button, index) =>
            this.renderActionListButton(button.toJS(), true, index)
          )}
        </div>
      </div>
    );
  }

  renderActionListButtonsGroups(listButtons, groups) {
    if (!this.showStatureSmall) {
      return null;
    }

    const result = [];
    groups.forEach((group, index) => {
      const list = listButtons.filter(
        (b) =>
          b.get('stature') === 'small' &&
          b.get('statureGroup', 'default') === group
      );
      result.push(this.renderActionListButtonsGroup(list, index));
    });
    return result;
  }

  renderActionListButtons(listButtons) {
    if (listButtons.size === 0) {
      return null;
    }

    const smalls = listButtons.filter((b) => b.get('stature') === 'small');
    const hasStatureSmall = smalls.size > 0;

    const groups = new Set();
    smalls.forEach((small) => groups.add(small.get('statureGroup', 'default')));

    const hasStatureMajor = !!listButtons.find(
      (b) => b.get('stature') === 'major'
    );

    if (hasStatureSmall && hasStatureMajor) {
      return (
        <div className={this.styles.classNames.actionsListWithStature}>
          <div className={this.styles.classNames.actionsListStature}>
            <Button
              shape="rounded"
              glyph={
                this.showStatureSmall
                  ? 'solid/chevron-down'
                  : 'solid/chevron-up'
              }
              onClick={() => (this.showStatureSmall = !this.showStatureSmall)}
            />
          </div>
          <div className={this.styles.classNames.actionsListMajor}>
            {listButtons
              .filter((b) => b.get('stature') === 'major')
              .map((button, index) =>
                this.renderActionListButton(button.toJS(), true, index)
              )}
          </div>
          {this.renderActionListButtonsGroups(listButtons, groups)}
        </div>
      );
    } else {
      return (
        <div className={this.styles.classNames.actionsList}>
          {listButtons.map((button, index) =>
            this.renderActionListButton(button.toJS(), false, index)
          )}
        </div>
      );
    }
  }

  renderActionButton(button, layout, index, count) {
    const secondary = layout === 'secondary';

    return (
      <Button
        key={index}
        kind={secondary ? 'secondary-action' : 'action'}
        width={secondary ? null : '0px'}
        grow={secondary ? null : '1'}
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
    const thirdButtons = this.props.buttons.filter(
      (b) => b.get('layout') === 'third'
    );
    const fourthButtons = this.props.buttons.filter(
      (b) => b.get('layout') === 'fourth'
    );
    const listButtons = this.props.buttons.filter(
      (b) => b.get('layout') === 'list'
    );

    if (fourthButtons.size > 0) {
      return (
        <div className={this.styles.classNames.actionsLines}>
          {this.renderActionListButtons(listButtons)}
          <div className={this.styles.classNames.actionsLineSecondary}>
            {this.renderActionButtonsList(fourthButtons, 'secondary')}
          </div>
          <div className={this.styles.classNames.actionsLineSecondary}>
            {this.renderActionButtonsList(thirdButtons, 'secondary')}
          </div>
          <div className={this.styles.classNames.actionsLineSecondary}>
            {this.renderActionButtonsList(secondaryButtons, 'secondary')}
          </div>
          <div className={this.styles.classNames.actionsLinePrimary}>
            {this.renderActionButtonsList(primaryButtons, 'primary')}
          </div>
        </div>
      );
    } else if (thirdButtons.size > 0) {
      return (
        <div className={this.styles.classNames.actionsLines}>
          {this.renderActionListButtons(listButtons)}
          <div className={this.styles.classNames.actionsLineSecondary}>
            {this.renderActionButtonsList(thirdButtons, 'secondary')}
          </div>
          <div className={this.styles.classNames.actionsLineSecondary}>
            {this.renderActionButtonsList(secondaryButtons, 'secondary')}
          </div>
          <div className={this.styles.classNames.actionsLinePrimary}>
            {this.renderActionButtonsList(primaryButtons, 'primary')}
          </div>
        </div>
      );
    } else if (secondaryButtons.size > 0) {
      return (
        <div className={this.styles.classNames.actionsLines}>
          {this.renderActionListButtons(listButtons)}
          <div className={this.styles.classNames.actionsLineSecondary}>
            {this.renderActionButtonsList(secondaryButtons, 'secondary')}
          </div>
          <div className={this.styles.classNames.actionsLinePrimary}>
            {this.renderActionButtonsList(primaryButtons, 'primary')}
          </div>
        </div>
      );
    } else if (listButtons.size > 0) {
      return (
        <div className={this.styles.classNames.actionsLines}>
          {this.renderActionListButtons(listButtons)}
          <div className={this.styles.classNames.actionsLinePrimary}>
            {this.renderActionButtonsList(primaryButtons, 'primary')}
          </div>
        </div>
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
      let nabuId = this.getSchema(
        `${this.props.entityType}.status.valuesInfo.${this.props.businessStatus}.text.nabuId`
      );
      if (!nabuId) {
        nabuId = this.props.businessStatus;
      }
      return (
        <div className={this.styles.classNames.statusBusiness}>
          <Label kind="pane-warning" text={{nabuId}} />
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

  renderAlerts() {
    return <EntityAlerts entityId={this.props.entityId} />;
  }

  renderStatus() {
    return (
      <React.Fragment>
        <div className={this.styles.classNames.status}>
          {this.renderStatusTopButtons()}
          {this.renderStatusBase()}
          {this.renderStatusBusiness()}
          {this.renderStatusButtons()}
        </div>
        {this.renderAlerts()}
      </React.Fragment>
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
        busy={this.props.loading}
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
      <Container kind="column-full" addClassName="hinter-container">
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

  renderWorkitem() {
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

  renderDeleteDialog() {
    if (!this.showDeleteDialog) {
      return null;
    }

    const archived = this.props.status === 'archived';

    let deleteAction = this.deleteAction;
    if (archived && deleteAction === 'archive') {
      deleteAction = 'unknown';
    }

    const list = [];
    if (!archived) {
      list.push({name: 'archive', description: T('Archiver')});
    }
    list.push({name: 'trash', description: T('Détruire')});

    const title = archived
      ? T('Voulez-vous détruire la fiche archivée ?')
      : T('Comment voulez-vous supprimer la fiche ?');

    let glyph, text, description, disabled, style;

    switch (deleteAction) {
      case 'archive':
        glyph = 'solid/archive';
        text = T('Archiver');
        description =
          '```Le __statut fiche__ deviendra __archivé__. Son apparition dans les recherches sera déterminé par les filtres. Il pourra en tout temps reprendre le statut __publié__.```';
        disabled = false;
        style = this.styles.classNames.deleteInfArchive;
        break;

      case 'trash':
        glyph = 'solid/tombstone';
        text = T('Détruire');
        description =
          "```La fiche ne sera plus indexée. En conséquence, elle n'apparaîtra plus dans les recherches. Elle reste à disposition du gestionnaire de données jusqu'à la prochaine opération de nettoyage.```";
        disabled = false;
        style = this.styles.classNames.deleteInfTrash;
        break;

      default:
        glyph = null;
        text = '';
        description = '';
        disabled = true;
        style = this.styles.classNames.deleteInfUnknown;
        break;
    }

    return (
      <DialogModal subkind="full">
        <div className={this.styles.classNames.deleteSup}>
          <Label text={title} />
          <div className={this.styles.classNames.deleteRadio}>
            <CheckList
              kind="radio"
              direction="column"
              selectionMode="single"
              list={list}
              value={deleteAction}
              selectionChanged={(a) => (this.deleteAction = a)}
            />
            <Label
              width="100px"
              height="100px"
              glyphSize="400%"
              glyph={glyph}
              glyphPosition="center"
              justify="center"
            />
          </div>
        </div>
        <div className={style}>
          <div className={this.styles.classNames.deleteDescription}>
            <Label text={description} width="500px" />
          </div>
          <div className={this.styles.classNames.deleteButtons}>
            {disabled ? null : (
              <Button
                kind="action"
                place="1/2"
                grow="1"
                glyph={glyph}
                text={text}
                onClick={this.onDoDelete}
              />
            )}
            <Button
              kind="action"
              place={disabled ? '1/1' : '2/2'}
              grow="1"
              glyph="solid/times"
              text={T('Annuler')}
              onClick={() => (this.showDeleteDialog = false)}
            />
          </div>
        </div>
      </DialogModal>
    );
  }

  render() {
    if (!this.props.id) {
      return <div>Missing id props on Workitem component</div>;
    }
    if (!this.props.entityId) {
      return <div>Missing entityId props on Workitem component</div>;
    }

    return (
      <>
        {this.renderWorkitem()}
        {this.renderDeleteDialog()}
      </>
    );
  }
}

/******************************************************************************/
export default Widget.connect((state, props) => {
  const loading = state.get(`backend.${props.id}.loading`, true);
  if (props.entityId) {
    return {
      status: state.get(`backend.${props.entityId}.meta.status`),
      businessStatus: state.get(`backend.${props.entityId}.status`),
      entityType: state.get(`backend.${props.entityId}.meta.type`),
      loading,
    };
  } else {
    return {
      status: null,
      businessStatus: null,
      entityType: null,
      loading,
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
    return <>{this.props.children}</>;
  }
}
