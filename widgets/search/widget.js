//T:2019-02-27
import T from 't';
import React from 'react';
import Form from 'laboratory/form';
import Widget from 'laboratory/widget';
import throttle from 'lodash/throttle';

import Container from 'gadgets/container/widget';
import Label from 'gadgets/label/widget';
import LabelTextField from 'gadgets/label-text-field/widget';
import Button from 'gadgets/button/widget';
import StatusFilters from 'desktop/status-filters/widget';
import List from 'gadgets/list/widget';

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
    clearInterval(this._renewInterval);
  }

  listNav() {
    this.navToDetail(this.props.parentId, this.props.id);
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
      !this._requestedId !== this.props.id
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
          </Button>
        ) : null}
      </Container>
    );
  }
}

const ListItem = Widget.connect((state, props) => {
  const id = state.get(`backend.${props.listId}.list.${props.itemId}`, null);
  const text = state.get(`backend.${id}.meta.summaries.description`);
  return {
    id,
    exists: state.has(`backend.${id}`),
    text,
    height: props.height,
    parentId: props.parentId.parentId,
    onDrillDown: props.parentId.onDrillDown,
  };
})(_ListItem);

class Search extends Form {
  constructor() {
    super(...arguments);

    this._entityIds = [];
    this._drillDownInternal = this._drillDownInternal.bind(this);
    this._drillDown = throttle(this._drillDownInternal, 100).bind(this);
    this.drillDown = this.drillDown.bind(this);
  }

  static get wiring() {
    return {
      id: 'id',
      name: 'name',
      title: 'title',
      type: 'type',
      hintText: 'hintText',
    };
  }

  _drillDownInternal() {
    const name = this.props.name || `${this.props.type}-search`;
    this.doAs(name, 'drill-down', {
      entityIds: this._entityIds,
    });
    this._entityIds = [];
  }

  drillDown(entityId) {
    this._entityIds.push(entityId);
    this._drillDown();
  }

  render() {
    const {id, title, hintText, type} = this.props;
    if (!id) {
      return null;
    }

    const Form = this.Form;
    const listId = `list@${id}`;

    const Count = this.mapWidgetToFormPlugin(
      p => (
        <Container busy={p.count === undefined}>{p.count} documents</Container>
      ),
      'count',
      'list',
      '.count'
    );

    return (
      <Container kind="view" width="400px" spacing="large">
        <Container kind="pane-header">
          <Label text={T('Recherche')} kind="pane-header" />
          <Count />
        </Container>
        <Container kind="panes" navigationName="search">
          <Container kind="pane">
            <Container kind="row-pane">
              <Label text={title} grow="1" kind="title" />
            </Container>
            <Form {...this.formConfig}>
              <Container kind="row-pane">
                <Container kind="column" grow="1">
                  <LabelTextField
                    id={`${this.props.id}$hinter`}
                    defaultFocus="true"
                    hinter={type}
                    labelGlyph="solid/search"
                    hintText={hintText}
                    grow="1"
                  />
                </Container>
              </Container>
            </Form>
            <StatusFilters id={listId} />
          </Container>
          <Container kind="pane">
            <List
              id={listId}
              renderItem={ListItem}
              parentId={{parentId: this.props.id, onDrillDown: this.drillDown}}
            />
          </Container>
        </Container>
      </Container>
    );
  }
}

export default Widget.Wired(Search)();
