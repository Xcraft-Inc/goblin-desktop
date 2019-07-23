//T:2019-04-09
import T from "t";
import React from "react";
import Form from "laboratory/form";
import Widget from "laboratory/widget";
import throttle from "lodash/throttle";

import Container from "gadgets/container/widget";
import Label from "gadgets/label/widget";
import Button from "gadgets/button/widget";
import StatusFilters from "desktop/status-filters/widget";
import List from "gadgets/list/widget";
import HinterField from "goblin-gadgets/widgets/hinter-field/widget";
import C from "goblin-laboratory/widgets/connect-helpers/c";
import TextFieldNew from "goblin-gadgets/widgets/text-field-new/widget";

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
    this.navToDetail(this.props.parentId, this.props.id);
  }

  render() {
    const containerProps = {};
    const text = this.props.text ? this.props.text : "…";

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
            {this.props.isReadyFlag && this.props.isReadyFlag === "true" ? (
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
    onDrillDown: props.data.onDrillDown
  };
})(_ListItem);

class Search extends Form {
  constructor() {
    super(...arguments);

    this._entityIds = [];
    this._drillDownInternal = this._drillDownInternal.bind(this);
    this._drillDown = throttle(this._drillDownInternal, 100).bind(this);
    this.drillDown = this.drillDown.bind(this);

    this.filter = this.filter.bind(this);
  }

  static get wiring() {
    return {
      id: "id",
      name: "name",
      title: "title",
      type: "type",
      hintText: "hintText"
    };
  }

  _drillDownInternal() {
    const name = this.props.name || `${this.props.type}-search`;
    this.doAs(name, "drill-down", {
      entityIds: this._entityIds,
      view: ["isReady", { meta: { summaries: ["description"] } }]
    });
    this._entityIds = [];
  }

  drillDown(entityId) {
    this._entityIds.push(entityId);
    this._drillDown();
  }

  filter(value) {
    this.doFor(`list@${this.props.id}`, "set-filter-value", {
      filterValue: value
    });
  }

  render() {
    const { id, title, hintText, type } = this.props;
    if (!id) {
      return null;
    }

    const Form = this.Form;
    const listId = `list@${id}`;

    const Count = this.mapWidgetToFormPlugin(
      p => (
        <Container busy={p.count === undefined}>
          <Label
            text={T(
              `{count, plural,
                 =0 {aucun document}
                 one {1 document}
                 other {{count} documents}
              }`,
              null,
              { count: p.count }
            )}
          />
        </Container>
      ),
      "count",
      "list",
      ".count"
    );

    return (
      <Container kind="views">
        <Container kind="view" width="600px">
          <Container kind="pane">
            <Container kind="row-pane">
              <Label text={title} grow="1" kind="title" /> <Count />
            </Container>
          </Container>

          <StatusFilters id={listId} />
        </Container>

        <Container kind="view" width="400px">
          <Container kind="panes" subkind="no-overlay" grow="0">
            <Container kind="pane">
              <Form {...this.formConfig}>
                <TextFieldNew
                  value={C(".value")}
                  changeMode="throttled"
                  onChange={this.filter}
                />
              </Form>
            </Container>
          </Container>
          <Container kind="panes" navigationName="search">
            <Container kind="pane">
              <List
                id={listId}
                renderItem={ListItem}
                data={{
                  parentId: this.props.id,
                  onDrillDown: this.drillDown
                }}
              />
            </Container>
          </Container>
        </Container>
      </Container>
    );
  }
}

export default Widget.Wired(Search)();
