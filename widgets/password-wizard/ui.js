import React from 'react';
import Container from 'gadgets/container/widget';
import Field from 'gadgets/field/widget';
import Button from 'gadgets/button/widget';

function renderMain(props) {
  const type = props.showPassword === 'true' ? {} : {type: 'password'};
  const disableRandomPasswordButton =
    props.passwordLength && Number.isInteger(parseInt(props.passwordLength))
      ? false
      : true;
  return (
    <Container kind="column" grow="1">
      <Field
        kind="field"
        labelWidth="30px"
        labelGlyph="solid/lock"
        hintText="Mot de passe"
        model=".form.password"
        grow="1"
        {...type}
      />
      <Field
        kind="bool"
        labelText="Afficher le mot de passe"
        model=".form.showPassword"
      />
      <Field
        kind="number"
        labelText="Longueur du mot de passe aléatoire"
        labelWidth="275px"
        width="325px"
        model=".form.passwordLength"
      />
      <Button
        kind="action"
        grow="1"
        place="1/1"
        width="495px"
        glyph="solid/user-secret"
        text="Générer un mot de passe aléatoire"
        disabled={disableRandomPasswordButton}
        onClick={() => props.do('setRandomPassword')}
      />
    </Container>
  );
}

/******************************************************************************/

const mapProps = entity => {
  return {
    showPassword: entity.get('form.showPassword'),
    passwordLength: entity.get('form.passwordLength'),
  };
};

/******************************************************************************/
export default {
  mappers: {
    main: mapProps,
  },

  main: renderMain,
};
