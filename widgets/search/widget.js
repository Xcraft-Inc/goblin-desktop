import React from 'react';
import Form from 'laboratory/form';

import Container from 'gadgets/container/widget';
import Label from 'gadgets/label/widget';
import LabelTextField from 'gadgets/label-text-field/widget';
import Button from 'gadgets/button/widget';
import List from 'gadgets/list/widget';
import CheckButton from 'gadgets/check-button/widget';
import Separator from 'gadgets/separator/widget';

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
                    defaultFocus="true"
                    hinter={type}
                    labelGlyph="solid/search"
                    hintText={hintText}
                    grow="1"
                  />
                  <Separator kind="exact" height="20px" />
                  <Container kind="row">
                    <Label width="30px" />
                    <CheckButton
                      justify="left"
                      heightStrategy="compact"
                      text="Brouillons"
                      tooltip="Montre les brouillons"
                      checked="false"
                    />
                  </Container>
                  <Container kind="row">
                    <Label width="30px" />
                    <CheckButton
                      justify="left"
                      heightStrategy="compact"
                      text="Publiés"
                      tooltip="Montre les éléments publiés"
                      checked="true"
                    />
                  </Container>
                  <Container kind="row">
                    <Label width="30px" />
                    <CheckButton
                      justify="left"
                      heightStrategy="compact"
                      text="Archivés"
                      tooltip="Montre les éléments archivés"
                      checked="false"
                    />
                  </Container>
                  <Separator kind="exact" height="50px" />
                  <Label bottomSpacing="large" text="Note" weight="bold" />
                  <Label
                    bottomSpacing="large"
                    text="La liste ci-dessous devrait disparaître et s'afficher dans le panneau central."
                  />
                  <Label
                    bottomSpacing="large"
                    text="Si le champ de recherche est vide, elle montre tous les éléments."
                  />
                  <Label
                    bottomSpacing="large"
                    text="Sinon, elle ne montre que les éléments qui contiennent le texte dans le champ de recherche (comme actuellement)."
                  />
                  <Label
                    bottomSpacing="large"
                    text="Dans les 2 cas, elle tient compte des 3 boutons à cocher."
                  />
                </Container>
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
                      onClick={() => this.navToDetail(this.props.id, props.id)}
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
                const text = entity.get('meta.summaries.description');
                return {text, id: entity.get('id')};
              }}
            />
          </Container>
        </Container>
      </Container>
    );
  }
}

export default Search;
