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
      <Label text={T(`Checker/Cleaner d'entité`)} />
      <Separator kind="space" height="10px" />

      <Field
        kind="bool"
        model=".form.setDefaultKeyValue"
        labelWidth="0px"
        labelText={T('Ajouter les clés manquantes avec leur valeur par défaut')}
        verticalSpacing="compact"
      />
      <Field
        kind="bool"
        model=".form.deleteMissingKeys"
        labelWidth="0px"
        labelText={T(
          'Supprimer les clés absentes du schéma (Use at your own risk ⚡⚠⚡)'
        )}
        verticalSpacing="compact"
      />
      <Separator kind="space" height="10px" />
      <Label text={T(`Sélectionnez les types d'entité à traiter :`)} />
      <Separator kind="space" height="10px" />
      <Container kind="row" width="500px">
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
