'use strict';

const T = require('goblin-nabu');
const {buildWizard} = require('goblin-desktop');
const workshopConfig = require('xcraft-core-etc')().load('goblin-workshop');
const entityStorage = workshopConfig.entityStorageProvider.replace(
  'goblin-',
  ''
);

/******************************************************************************/

function isTrue(value) {
  const type = typeof value;
  if (type === 'boolean') {
    return value;
  } else if (type === 'string') {
    return value === 'true';
  } else {
    return false; // if undefined, never true
  }
}

function buildTableList(tableList) {
  const data = {
    header: [
      {
        name: 'description',
        grow: '1',
        textAlign: 'left',
      },
    ],
    rows: [],
  };

  for (const table of tableList) {
    data.rows.push({
      id: table,
      description: table,
    });
  }

  return data;
}

function* addEntityNotification(
  quest,
  desktop,
  entityType,
  countErrors,
  clean
) {
  const action = clean ? 'du nettoyage' : 'de la vérification';
  const message =
    countErrors === 0
      ? T(
          `Aucune erreur trouvée. Fin {action} de la table {entityType}.`,
          null,
          {
            action,
            entityType,
          }
        )
      : T(
          `{countErrors} erreurs trouvées. Fin {action} de la table {entityType}.`,
          null,
          {
            action,
            countErrors,
            entityType,
          }
        );

  yield desktop.addNotification({
    notificationId: `notification@${quest.uuidV4()}`,
    glyph: countErrors === 0 ? 'solid/check' : 'solid/exclamation-triangle',
    color: countErrors === 0 ? 'green' : 'red',
    message,
  });
}

function* addFinalNotification(quest, desktop, form, clean) {
  const tablesNumber = form.selectedTables.length;
  if (tablesNumber > 1) {
    const action = clean ? 'du nettoyage' : 'de la vérification';
    const message = T(
      `Fin {action} {length, plural, one {de la table {tables}} other {des tables: {tables}s}}`,
      null,
      {
        action,
        length: tablesNumber,
        tables: form.selectedTables.join(', '),
      }
    );

    yield desktop.addNotification({
      notificationId: `notification@${quest.uuidV4()}`,
      glyph: 'solid/stop',
      color: 'blue',
      message,
    });
  }
}

/******************************************************************************/

const config = {
  name: 'data-check',
  title: T("Vérification de l'intégrité des données"),
  dialog: {
    width: '800px',
  },

  gadgets: {
    tablesTable: {
      type: 'table',
      onActions: {
        select: (state, action) => {
          return state.set('form.selectedTables', action.get('selectedIds'));
        },
        doubleClick: state => state,
      },
    },
  },

  steps: {
    initialize: {
      quest: function*(quest) {
        const r = quest.getStorage(entityStorage);
        const tableList = yield r.listTableFromDb({fromDb: quest.getSession()});
        yield quest.me.useTablesTable({
          action: 'setData',
          payload: {data: buildTableList(tableList)},
        });

        yield quest.me.next();
      },
    },

    prepare: {
      updateButtonsMode: 'onChange',
      buttons: function(quest, buttons, form) {
        const selectedTables = form.get('selectedTables');
        const disabled =
          !selectedTables || (selectedTables && selectedTables.length < 1);
        const clean =
          isTrue(form.get('fixMissingProperties')) ||
          isTrue(form.get('deleteUndefinedSchemaProps'));
        return buttons.set('main', {
          glyph: clean ? 'solid/shower' : 'solid/search',
          text: clean
            ? T('Démarrer le nettoyage')
            : T('Démarrer la vérification'),
          grow: disabled ? '0.5' : '2',
          disabled: disabled,
        });
      },
      form: {
        fixMissingProperties: false,
        deleteUndefinedSchemaProps: false,
      },
      quest: function*(quest, form) {},
    },

    finish: {
      form: {},
      quest: function*(quest, form, next) {
        const fixMissingProperties = isTrue(form.fixMissingProperties);
        const deleteUndefinedSchemaProps = isTrue(
          form.deleteUndefinedSchemaProps
        );
        const clean = fixMissingProperties || deleteUndefinedSchemaProps;

        const desktopId = quest.getDesktop();
        const desktop = quest.getAPI(desktopId).noThrow();

        for (const entityType of form.selectedTables) {
          const schemaAPI = quest.getAPI(`entity-schema@${entityType}`);
          const countErrors = yield schemaAPI.checkEntities({
            desktopId,
            batckSize: 1000,
            fixMissingProperties,
            deleteUndefinedSchemaProps,
          });
          yield* addEntityNotification(
            quest,
            desktop,
            entityType,
            countErrors,
            clean
          );
        }

        yield* addFinalNotification(quest, desktop, form, clean);
        yield quest.me.next();
      },
    },
  },
};

module.exports = buildWizard(config);
