'use strict';
//T:2019-02-27

const T = require('goblin-nabu');
const {buildWizard} = require('goblin-desktop');
const workshopConfig = require('xcraft-core-etc')().load('goblin-workshop');
const entityStorage = workshopConfig.entityStorageProvider.replace(
  'goblin-',
  ''
);

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

/******************************************************************************/

const config = {
  name: 'data-check',
  title: T("Vérification de l'intégrité des données"),
  dialog: {
    width: '500px',
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
        return buttons.set('main', {
          glyph: 'solid/play',
          text: 'Démarrer la vérification',
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
        let {fixMissingProperties, deleteUndefinedSchemaProps} = form;
        if (fixMissingProperties === 'true') {
          fixMissingProperties = true;
        }
        if (deleteUndefinedSchemaProps === 'true') {
          deleteUndefinedSchemaProps = true;
        }
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
          yield desktop.addNotification({
            notificationId: `notification@${quest.uuidV4()}`,
            glyph:
              countErrors === 0 ? 'solid/check' : 'solid/exclamation-triangle',
            color: countErrors === 0 ? 'green' : 'red',
            message:
              countErrors === 0
                ? T(
                    `Aucune erreur trouvée. Fin du check/nettoyage de la table {entityType}.`,
                    null,
                    {
                      entityType,
                    }
                  )
                : T(
                    `{countErrors} erreurs trouvées. Fin du check/nettoyage de la table {entityType}.`,
                    null,
                    {
                      countErrors,
                      entityType,
                    }
                  ),
          });
        }

        const tablesNumber = form.selectedTables.length;
        if (tablesNumber > 1) {
          const tables = form.selectedTables.join(', ');
          yield desktop.addNotification({
            notificationId: `notification@${quest.uuidV4()}`,
            glyph: 'solid/stop',
            color: 'blue',
            message: T(
              `Fin du check/nettoyage {length, plural, one {de la table {tables}} other {des tables: {tables}s}}`,
              null,
              {
                length: tablesNumber,
                tables,
              }
            ),
          });
        }

        yield quest.me.next();
      },
    },
  },
};

module.exports = buildWizard(config);
