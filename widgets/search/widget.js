import React from 'react';
import Form from 'laboratory/form';
import Widget from 'laboratory/widget';

import Container from 'gadgets/container/widget';
import Label from 'gadgets/label/widget';
import LabelTextField from 'gadgets/label-text-field/widget';
import Button from 'gadgets/button/widget';
import List from 'gadgets/list/widget';

class _DefaultItem extends Widget {
  render() {
    return (
      <Label
        text={this.props.text}
        kind="large-single"
        justify="left"
        grow="1"
        wrap="no"
      />
    );
  }
}

const DefaultItem = Widget.connect((state, props) => {
  return {
    text: props.id
      ? state.get(`backend.${props.id}.meta.summaries.description`)
      : '',
  };
})(_DefaultItem);

class _ListItem extends Widget {
  constructor() {
    super(...arguments);
    this.listNav = this.listNav.bind(this);
  }

  listNav() {
    this.navToDetail(this.props.parentId, this.props.id);
  }
  render() {
    const containerProps = {};
    if (!this.props.id && this.props.height) {
      containerProps.height = `${this.props.height}px`;
    }
    return (
      <Container
        {...containerProps}
        kind="row-pane"
        subkind="large-box"
        busy={!this.props.id}
      >
        <Button kind="container" width="100%" onClick={this.listNav}>
          {this.props.id ? <DefaultItem id={this.props.id} /> : null}
        </Button>
      </Container>
    );
  }
}

const ListItem = Widget.connect((state, props) => {
  const id = state.get(`backend.${props.listId}.list.${props.itemId}`, null);
  return {
    id,
    height: props.height,
    parentId: props.parentId,
  };
})(_ListItem);

class Search extends Form {
  constructor() {
    super(...arguments);
  }

  static get wiring() {
    return {
      id: 'id',
      title: 'title',
      type: 'type',
      hintText: 'hintText',
    };
  }

  render() {
    const {id, title, hintText, type} = this.props;
    if (!id) {
      return null;
    }

    const Form = this.Form;
    const DocumentsList = List.connectTo(this);

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
          <Label text="Recherche" kind="pane-header" />
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
          </Container>

          <DocumentsList renderItem={ListItem} parentId={this.props.id} />
        </Container>
      </Container>
    );
  }
}

export default Widget.Wired(Search)();
