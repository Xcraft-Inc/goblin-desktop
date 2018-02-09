import React from 'react';
import Form from 'laboratory/form';
import Container from 'gadgets/container/widget';
import Label from 'gadgets/label/widget';
import LabelTextField from 'gadgets/label-text-field/widget';
import Button from 'gadgets/button/widget';
import List from 'gadgets/list/widget';

class Search extends Form {
  constructor () {
    super (...arguments);
  }

  static get wiring () {
    return {
      id: 'id',
      title: 'title',
      type: 'type',
      hintText: 'hintText',
    };
  }

  render () {
    const {id, title, hintText, type} = this.props;
    if (!id) {
      return null;
    }

    const Form = this.Form;
    const DocumentsList = List.connectTo (this);

    const Count = this.mapWidgetToFormPlugin (
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
                <LabelTextField
                  defaultFocus="true"
                  hinter={type}
                  labelGlyph="solid/search"
                  hintText={hintText}
                  grow="1"
                />
              </Container>
            </Form>
          </Container>

          <Container kind="pane">
            <DocumentsList
              renderItem={props => {
                return (
                  <Container kind="row-pane" subkind="large-box">
                    <Button
                      kind="container"
                      width="100%"
                      onClick={() => this.navToDetail (this.props.id, props.id)}
                      onDoubleClick={() => {}}
                    >
                      <Label
                        text={props.text}
                        kind="large-single"
                        justify="left"
                        grow="1"
                        wrap="no"
                      />
                    </Button>
                  </Container>
                );
              }}
              mapItem={entity => {
                const text = entity.get ('meta.summaries.description');
                return {text, id: entity.get ('id')};
              }}
            />
          </Container>

        </Container>
      </Container>
    );
  }
}

export default Search;
