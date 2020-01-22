//T:2019-04-09

import T from 't';
import React from 'react';
import FrontendForm from 'goblin-laboratory/widgets/frontend-form/widget';
import Widget from 'goblin-laboratory/widgets/widget';
import throttle from 'lodash/throttle';

import Container from 'goblin-gadgets/widgets/container/widget';
import Label from 'goblin-gadgets/widgets/label/widget';
import Button from 'goblin-gadgets/widgets/button/widget';
import StatusFilters from 'goblin-desktop/widgets/status-filters/widget';
import C from 'goblin-laboratory/widgets/connect-helpers/c';
import TextFieldNew from 'goblin-gadgets/widgets/text-field-new/widget';

import EntityView from 'goblin-desktop/widgets/entity-view/widget';

/******************************************************************************/

class _ListItem extends Widget {
  constructor() {
    super(...arguments);

    this._requestedId = null;
    this.listNav = this.listNav.bind(this);
    this.renewTTL = this.renewTTL.bind(this);
    this._renewInterval = null;
  }

  renewTTL(id) {
    if (this._renewInterval) {
      clearInterval(this._renewInterval);
    }
    this._renewInterval = setInterval(this.props.onDrillDown, 15000, id);
  }

  componentWillUnmount() {
    super.componentWillUnmount();
    clearInterval(this._renewInterval);
  }

  listNav() {
    this.navToDetail(this.props.parentId, this.props.id, this.props.hinter);
  }

  render() {
    const containerProps = {};
    const text = this.props.text ? this.props.text : '…';

    if ((!this.props.exists || !this.props.text) && this.props.height) {
      containerProps.height = `${this.props.height}px`;
    }

    if (
      this.props.onDrillDown &&
      this.props.id &&
      this._requestedId !== this.props.id
    ) {
      setTimeout(this.props.onDrillDown, 0, this.props.id);
      this.renewTTL(this.props.id);
      this._requestedId = this.props.id;
    }

    return (
      <Container
        {...containerProps}
        kind="row-pane"
        subkind="large-box"
        busy={!this.props.exists}
      >
        {this.props.exists ? (
          <Button kind="container" width="100%" onClick={this.listNav}>
            <Label
              text={text}
              kind="large-single"
              justify="left"
              grow="1"
              wrap="no"
            />
            {this.props.isReadyFlag && this.props.isReadyFlag === 'true' ? (
              <Label glyph="solid/check" fontSize="70%" />
            ) : null}
            <Label text={this.props.index + 1} fontSize="70%" />
          </Button>
        ) : null}
      </Container>
    );
  }
}

const ListItem = Widget.connect((state, props) => {
  const id = state.get(`backend.${props.listId}.list.${props.itemId}`, null);
  const text = state.get(
    `backend.entity-view@${id}.meta.summaries.description`
  );
  const isReadyFlag = state.get(`backend.entity-view@${id}.isReady`, null);
  return {
    id,
    exists: state.has(`backend.entity-view@${id}`),
    text,
    isReadyFlag,
    height: props.height,
    index: props.index,
    parentId: props.data.parentId,
    onDrillDown: props.data.onDrillDown,
    hinter: props.data.hinter,
  };
})(_ListItem);

/******************************************************************************/

class HinterNewButton extends Widget {
  constructor() {
    super(...arguments);
    this.onNew = this.onNew.bind(this);
  }

  static get wiring() {
    return {
      id: 'id',
      type: 'type',
      kind: 'kind',
      title: 'title',
      glyph: 'glyph',
      status: 'status',
      onNew: 'onNew',
      withDetails: 'withDetails',
      newButtonTitle: 'newButtonTitle',
    };
  }

  onNew() {
    const model = this.getRouting()
      .get('location.hash')
      .substring(1);
    const value = this.getModelValue(model, true);
    this.doAs('hinter', 'create-new', {value});
  }

  render() {
    const {id, onNew, title} = this.props;

    if (!id) {
      return null;
    }
    return (
      <React.Fragment>
        {onNew ? (
          <Button
            kind="action"
            place="1/1"
            glyph="solid/plus"
            text={title}
            grow="1"
            onClick={this.onNew}
          />
        ) : null}
      </React.Fragment>
    );
  }
}
const NewEntityButton = Widget.Wired(HinterNewButton)();

/******************************************************************************/

class CountNC extends Widget {
  render() {
    const p = this.props;
    return (
      <Container busy={p.count === undefined}>
        <Label
          text={T(
            `{count, plural,
       =0 {Aucun élément}
       one {1/{initialCount} élément}
       other {{count}/{initialCount} éléments}
    }`,
            null,
            {count: p.count, initialCount: p.initialCount}
          )}
        />
      </Container>
    );
  }
}
const Count = Widget.connect((state, props) => {
  return {
    count: state.get(`backend.${props.id}.count`, 0),
    initialCount: state.get(`backend.${props.id}.initialCount`, 0),
  };
})(CountNC);

/******************************************************************************/

class Search extends Widget {
  constructor() {
    super(...arguments);

    this.state = {
      showParams: true,
    };

    this.onToggleParams = this.onToggleParams.bind(this);
    this._entityIds = [];
    this._drillDownInternal = this._drillDownInternal.bind(this);
    this._drillDown = throttle(this._drillDownInternal, 100).bind(this);
    this.drillDown = this.drillDown.bind(this);
    this.filter = this.filter.bind(this);
  }

  static get wiring() {
    return {
      id: 'id',
      name: 'name',
      title: 'title',
      type: 'type',
      hinter: 'hinter',
      hinterId: 'hinterId',
      hintText: 'hintText',
    };
  }

  //#region get/set
  get showParams() {
    return this.state.showParams;
  }

  set showParams(value) {
    this.setState({
      showParams: value,
    });
  }
  //#endregion

  onToggleParams() {
    this.showParams = !this.showParams;
  }

  _drillDownInternal() {
    const name = this.props.name || `${this.props.type}-search`;
    this.doAs(name, 'drill-down', {
      entityIds: this._entityIds,
      view: ['isReady', {meta: {summaries: ['description']}}],
    });
    this._entityIds = [];
  }

  drillDown(entityId) {
    this._entityIds.push(entityId);
    this._drillDown();
  }

  filter(value) {
    this.dispatchTo(
      this.props.id,
      {type: 'CHANGE', path: 'value', newValue: value},
      'frontend-form'
    );
    this.doFor(`list@${this.props.id}`, 'set-filter-value', {
      filterValue: value,
    });
  }

  renderParams() {
    const listId = `list@${this.props.id}`;

    return (
      <div className={this.styles.classNames.params}>
        <div className={this.styles.classNames.pane}>
          <Label text={this.props.title} grow="1" kind="title" />
          <div className={this.styles.classNames.separator} />
          <FrontendForm widgetId={this.props.id} initialState={{value: ''}}>
            <TextFieldNew
              hintText={this.props.hintText}
              value={C('.value')}
              changeMode="throttled"
              onChange={this.filter}
              autoFocus={true}
              selectAllOnFocus={true}
            />
          </FrontendForm>
        </div>

        <div className={this.styles.classNames.pane}>
          <StatusFilters id={listId} />
        </div>

        <div className={this.styles.classNames.pane}>
          <Count id={listId} />
        </div>

        <div className={this.styles.classNames.sajex} />

        <div className={this.styles.classNames.lastPane}>
          <NewEntityButton id={this.props.hinterId} />
        </div>
      </div>
    );
  }

  renderList() {
    return (
      <EntityView
        id={this.props.id}
        hinter={this.props.hinter}
        disableToolbar="true"
        type={this.props.type}
      />
    );
  }

  renderButton() {
    const style = this.showParams
      ? this.styles.classNames.button
      : this.styles.classNames.buttonWithoutParams;

    return (
      <div className={style}>
        <Button
          width="24px"
          height="24px"
          glyph={this.showParams ? 'solid/chevron-left' : 'solid/chevron-right'}
          onClick={this.onToggleParams}
        />
      </div>
    );
  }

  render() {
    if (!this.props.id) {
      return null;
    }

    const style = this.showParams
      ? this.styles.classNames.search
      : this.styles.classNames.searchWithoutParams;

    return (
      <div className={style}>
        {this.renderParams()}
        {this.renderList()}
        {this.renderButton()}
      </div>
    );
  }
}

/******************************************************************************/

export default Widget.Wired(Search)();
