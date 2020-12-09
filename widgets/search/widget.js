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
import TextField from 'goblin-gadgets/widgets/text-field/widget';

import EntityView from 'goblin-desktop/widgets/entity-view/widget';

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
    const model = this.getRouting().get('location.hash').substring(1);
    const value = this.getModelValue(model, true);
    this.doAs('hinter', 'create-new', {
      value,
    });
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
    this.resetFilter = this.resetFilter.bind(this);
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
      {type: 'select-row', rowId: null, entityId: null},
      'entity-view'
    );
    this.dispatchTo(
      this.props.id,
      {type: 'CHANGE', path: 'value', newValue: value},
      'frontend-form'
    );
    this.doFor(`list@${this.props.id}`, 'set-filter-value', {
      filterValue: value,
    });
  }

  resetFilter() {
    this.filter('');
  }

  renderParams() {
    const listId = `list@${this.props.id}`;

    return (
      <div className={this.styles.classNames.params}>
        <div className={this.styles.classNames.pane}>
          <Label text={this.props.title} grow="1" kind="title" />
          <div className={this.styles.classNames.separator} />
          <FrontendForm widgetId={this.props.id}>
            <Container kind="row">
              <TextField
                grow="1"
                hintText={this.props.hintText || T('Chercher')}
                value={C('.value')}
                changeMode="throttled"
                onChange={this.filter}
                autoFocus={true}
                selectAllOnFocus={true}
                shape={this.props.hasFilter ? 'left-rounded' : 'rounded'}
                horizontalSpacing={this.props.hasFilter ? 'overlap' : null}
              />
              {this.props.hasFilter ? (
                <Button
                  shape="right-rounded"
                  glyph="solid/times"
                  tooltip={T('Tout montrer')}
                  onClick={this.resetFilter}
                />
              ) : null}
            </Container>
          </FrontendForm>
        </div>

        <div className={this.styles.classNames.scrollablePane}>
          <StatusFilters id={listId} type={this.props.type} />
          <div className={this.styles.classNames.separator} />
          <Count id={listId} />
        </div>

        <div className={this.styles.classNames.sajex} />

        <Container kind="actions">
          <NewEntityButton id={this.props.hinterId} />
        </Container>
      </div>
    );
  }

  renderList() {
    return (
      <EntityView
        id={this.props.id}
        hinter={this.props.hinter}
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
          kind="subaction"
          width="20px"
          height="20px"
          glyph={this.showParams ? 'solid/chevron-left' : 'solid/chevron-right'}
          glyphSize="80%"
          onClick={this.onToggleParams}
        />
      </div>
    );
  }

  render() {
    if (!this.props.id || !this.props.type) {
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

const ConnectedSearch = Widget.connect((state, prop) => {
  const hasFilter = !!state.get(`widgets.${prop.id}.value`, null);
  return {hasFilter};
})(Search);

export default Widget.Wired(ConnectedSearch)();
