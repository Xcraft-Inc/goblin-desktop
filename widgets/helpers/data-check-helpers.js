const {isShredder} = require('xcraft-core-shredder');
const T = require('goblin-nabu/widgets/helpers/t.js');

//-----------------------------------------------------------------------------

function isChecked(form, option) {
  if (isShredder(form)) {
    return form.get(option);
  } else {
    return form[option];
  }
}

//-----------------------------------------------------------------------------

const types = [
  {
    type: 'entityId',
    description: T('entityId'),
  },
  {
    type: 'string',
    description: T('string'),
  },
  {
    type: 'bool',
    description: T('bool'),
  },
  {
    type: 'enum',
    description: T('enum'),
  },
  {
    type: 'typed',
    description: T('typed'),
  },
  {
    type: 'array',
    description: T('array'),
  },
  {
    type: 'object',
    description: T('object'),
  },
  {
    type: 'pointer-reference',
    description: T('reference (pointeurs)'),
  },
  {
    type: 'pointer-value',
    description: T('value (pointeurs)'),
  },
];

const items = [
  {
    position: 'left',
    title: T('Vérification à effectuer :'),
  },
  {
    position: 'left',
    option: 'check-value-fields',
    description: T('Vérifier les contenus des champs'),
    checking: true,
  },
  {
    position: 'left',
    option: 'check-missing-fields',
    description: T('Vérifier les champs manquants'),
    checking: true,
  },
  {
    position: 'left',
    option: 'check-undefined-schema-fields',
    description: T('Vérifier les champs absents du schéma'),
    checking: true,
    withoutTypes: true,
  },
  // -----------
  {
    position: 'right',
    title: T('Nettoyages à effectuer :'),
  },
  {
    position: 'right',
    option: 'fix-value-fields',
    description: T('Corriger les contenus des champs'),
    cleaning: true,
  },
  {
    position: 'right',
    option: 'fix-missing-fields',
    description: T('Ajouter les champs manquants avec leur valeur par défaut'),
    cleaning: true,
  },
  {
    position: 'right',
    option: 'delete-undefined-schema-fields',
    description: T(
      //? "Supprimer les champs absents du schéma (véfifiez que ces champs n'ont pas été oubliés dans le schéma)"
      'Supprimer les champs absents du schéma'
    ),
    cleaning: true,
    withoutTypes: true,
    dangerous: true,
  },
];

function getCleaning(selectedTypes, form) {
  let type = false;
  let checking = false;
  let cleaning = false;
  let dangerous = false;

  for (const selectedType of selectedTypes) {
    type = true;
  }

  for (const item of items) {
    if (isChecked(form, item.option)) {
      if (item.withoutTypes) {
        type = true;
      }
      if (item.checking) {
        checking = true;
      }
      if (item.cleaning) {
        cleaning = true;
      }
      if (item.dangerous) {
        dangerous = true;
      }
    }
  }

  const glyph = cleaning
    ? dangerous
      ? 'solid/exclamation-triangle'
      : 'solid/shower'
    : 'solid/search';

  const action = cleaning
    ? dangerous
      ? T('Démarrer le nettoyage dangereux')
      : T('Démarrer le nettoyage')
    : T('Démarrer la vérification');

  const enabled = type && (checking || cleaning);

  return {enabled, cleaning, glyph, action};
}

// Return the choices of the user.
function getOptions(form) {
  const options = [];

  for (const item of items) {
    if (isChecked(form, item.option)) {
      options.push(item.option);
    }
  }

  return options;
}

//-----------------------------------------------------------------------------

module.exports = {
  types,
  items,
  getCleaning,
  getOptions,
};
