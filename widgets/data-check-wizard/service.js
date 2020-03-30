'use strict';

const T = require('goblin-nabu');
const {buildWizard} = require('goblin-desktop');
const workshopConfig = require('xcraft-core-etc')().load('goblin-workshop');
const Bool = require('goblin-gadgets/widgets/helpers/bool-helpers');
const DataCheckHelpers = require('../helpers/data-check-helpers');
const entityStorage = workshopConfig.entityStorageProvider.replace(
  'goblin-',
  ''
);

/******************************************************************************/

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
  cleaning
) {
  const action = cleaning ? 'du nettoyage' : 'de la vérification';
  const message =
    countErrors === 0
      ? T(
          `Aucune erreur trouvée. Fin {action} de la table {entityType}.`,
          null,
          {
            action,
            entityType: `'${entityType}'`,
          }
        )
      : T(
          `{countErrors} erreurs trouvées. Fin {action} de la table {entityType}.`,
          null,
          {
            action,
            countErrors,
            entityType: `'${entityType}'`,
          }
        );

  yield desktop.addNotification({
    notificationId: `notification@${quest.uuidV4()}`,
    glyph: countErrors === 0 ? 'solid/check' : 'solid/exclamation-triangle',
    color: countErrors === 0 ? 'green' : 'red',
    message,
  });
}

function* addFinalNotification(quest, desktop, form, cleaning) {
  const tablesNumber = form.selectedTables.length;
  if (tablesNumber > 1) {
    const action = cleaning ? 'du nettoyage' : 'de la vérification';
    const message = T(
      `Fin {action} {length, plural, one {de la table {tables}} other {des tables: {tables}}}`,
      null,
      {
        action,
        length: tablesNumber,
        tables: form.selectedTables.map(t => `'${t}'`).join(', '),
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
        const r = DataCheckHelpers.getCleaning(form);
        const disabled =
          !r.enabled ||
          !selectedTables ||
          (selectedTables && selectedTables.length < 1);

        return buttons.set('main', {
          glyph: r.glyph,
          text: r.action,
          grow: disabled ? '0.5' : '2',
          disabled: disabled,
        });
      },
      form: {},
      quest: function*(quest, form) {},
    },

    finish: {
      form: {},
      quest: function*(quest, form, next) {
        const options = DataCheckHelpers.getOptions(form);
        const r = DataCheckHelpers.getCleaning(form);

        const desktopId = quest.getDesktop();
        const desktop = quest.getAPI(desktopId).noThrow();

        for (const entityType of form.selectedTables) {
          const schemaAPI = quest.getAPI(`entity-schema@${entityType}`);
          const countErrors = yield schemaAPI.checkEntities({
            desktopId,
            batchSize: 1000,
            options,
          });
          yield* addEntityNotification(
            quest,
            desktop,
            entityType,
            countErrors,
            r.cleaning
          );
        }

        yield* addFinalNotification(quest, desktop, form, r.cleaning);
        yield quest.me.next();
      },
    },
  },
};

module.exports = buildWizard(config);
