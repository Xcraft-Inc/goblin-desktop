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
      <Label text={T(`Vérification et/ou nettoyage d'entités`)} />
      <Separator kind="space" height="10px" />

      <Field
        kind="bool"
        model=".form.fixMissingProperties"
        labelWidth="0px"
        labelText={T(
          'Ajouter les champs manquants avec leur valeur par défaut'
        )}
        verticalSpacing="compact"
      />
      <Field
        kind="bool"
        model=".form.deleteUndefinedSchemaProps"
        labelWidth="0px"
        labelText={T('Supprimer les champs absents du schéma')}
        verticalSpacing="compact"
      />
      <Label
        width="800px"
        glyph="solid/exclamation-triangle"
        text={T(
          "À n'utiliser qu'après avoir véfifié que les champs surnuméraires n'ont pas été oubliés dans le schéma !"
        )}
      />

      <Separator kind="space" height="10px" />
      <Label text={T("Sélectionnez les types d'entité à traiter :")} />
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
