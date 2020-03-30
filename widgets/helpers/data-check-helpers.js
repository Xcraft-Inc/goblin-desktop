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

const items = [
  {
    position: 'left',
    title: T('Champs à prendre en compte :'),
  },
  {
    position: 'left',
    option: 'field-entityId',
    description: T("Champs de type 'entityId'"),
    field: true,
  },
  {
    position: 'left',
    option: 'field-string',
    description: T("Champs de type 'string'"),
    field: true,
  },
  {
    position: 'left',
    option: 'field-bool',
    description: T("Champs de type 'bool'"),
    field: true,
  },
  {
    position: 'left',
    option: 'field-enum',
    description: T("Champs de type 'enum'"),
    field: true,
  },
  {
    position: 'left',
    option: 'field-typed',
    description: T("Champs de type 'typed'"),
    field: true,
  },
  {
    position: 'left',
    option: 'field-array',
    description: T("Champs de type 'array'"),
    field: true,
  },
  {
    position: 'left',
    option: 'field-object',
    description: T("Champs de type 'object'"),
    field: true,
  },
  {
    position: 'left',
    option: 'field-pointer-reference',
    description: T("Pointeurs de type 'reference'"),
    field: true,
  },
  {
    position: 'left',
    option: 'field-pointer-value',
    description: T("Pointeurs de type 'value'"),
    field: true,
  },
  // -----------
  {
    position: 'right',
    title: T('Vérification à effectuer :'),
  },
  {
    position: 'right',
    option: 'check-value-fields',
    description: T('Vérifier les contenus des champs'),
    checking: true,
  },
  {
    position: 'right',
    option: 'check-missing-fields',
    description: T('Vérifier les champs manquants'),
    checking: true,
  },
  {
    position: 'right',
    option: 'check-undefined-schema-fields',
    description: T('Vérifier les champs absents du schéma'),
    checking: true,
  },
  // -----------
  {
    position: 'right',
    separator: true,
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
    dangerous: true,
  },
];

// Return true if the user has chosen to clean.
function getCleaning(form) {
  let field = false;
  let checking = false;
  let cleaning = false;
  let dangerous = false;

  for (const item of items) {
    if (isChecked(form, item.option)) {
      if (item.field) {
        field = true;
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

  const enabled = field && (checking || cleaning);

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
  items,
  getCleaning,
  getOptions,
};
