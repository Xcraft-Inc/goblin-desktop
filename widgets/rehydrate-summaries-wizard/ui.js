//T:2019-02-27
import React from 'react';
import T from 't';
import Container from 'goblin-gadgets/widgets/container/widget';
import Label from 'goblin-gadgets/widgets/label/widget';
import Separator from 'goblin-gadgets/widgets/separator/widget';
import Field from 'goblin-gadgets/widgets/field/widget';

function prepare(props) {
  return (
    <Container kind="column" grow="1">
      <Label text={T('Sélectionnez les entités à réhydrater')} />
      <Separator kind="space" height="10px" />

      <Container kind="row" grow="1">
        <Container kind="column" grow="1">
          <Field
            kind="bool"
            model=".form.onlyPublished"
            labelWidth="0px"
            labelText={T('Seulement les publiés')}
            verticalSpacing="compact"
          />

          <Field
            kind="bool"
            model=".form.mustBuildSummaries"
            labelWidth="0px"
            labelText={T('Reconstruire les descriptions')}
            verticalSpacing="compact"
          />

          <Field
            kind="bool"
            model=".form.mustIndex"
            labelWidth="0px"
            labelText={T('Réindexer dans le moteur de recherche')}
            verticalSpacing="compact"
          />
        </Container>

        <Container kind="column" grow="1">
          <Field
            kind="bool"
            model=".form.mustCompute"
            labelWidth="0px"
            labelText={T('Recalculer')}
            verticalSpacing="compact"
          />

          <Field
            kind="bool"
            model=".form.mustRebuild"
            labelWidth="0px"
            labelText={T('Consolider les valeurs manquantes')}
            verticalSpacing="compact"
          />

          <Field
            kind="bool"
            model=".form.emitHydrated"
            labelWidth="0px"
            labelText={T("Emettre l'événement '-hydrated' (/!side-effects)")}
            verticalSpacing="compact"
          />
        </Container>
      </Container>

      <Separator kind="space" height="10px" />
      <Container kind="row" width="800px">
        <Field
          kind="gadget"
          name="tablesTable"
          selectionMode="multi"
          frame="true"
          hasButtons="true"
          height="300px"
          grow="1"
        />
      </Container>
    </Container>
  );
}

/******************************************************************************/
export default {
  prepare,
};
