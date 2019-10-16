//T:2019-02-27
import React from 'react';
import T from 't';
import Container from 'gadgets/container/widget';
import Label from 'gadgets/label/widget';
import Separator from 'gadgets/separator/widget';
import Field from 'gadgets/field/widget';

function prepare(props) {
  return (
    <Container kind="column" grow="1">
      <Label text={T('Sélectionnez les entités à réhydrater')} />
      <Separator kind="space" height="10px" />

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

      <Separator kind="space" height="10px" />
      <Container kind="row">
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
