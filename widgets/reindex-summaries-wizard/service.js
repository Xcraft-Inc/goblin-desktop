'use strict';
//T:2019-02-27

const T = require('goblin-nabu');
const {buildWizard} = require('goblin-desktop');
const os = require('os');
const fs = require('fs');
const path = require('path');
const Papa = require('papaparse');
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
  name: 'reindex-summaries',
  title: T('Réindexeur'),
  dialog: {
    width: '500px',
  },
  gadgets: {
    tablesTable: {
      type: 'table',
      onActions: {
        syncSelect: (state, action) => {
          return state.set('form.selectedTables', action.get('selectedIds'));
        },
        doubleClick: (state) => state,
      },
    },
  },
  steps: {
    initialize: {
      quest: function* (quest) {
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
      buttons: function (quest, buttons, form) {
        const selectedTables = form.get('selectedTables');
        const disabled =
          !selectedTables || (selectedTables && selectedTables.length < 1);
        return buttons.set('main', {
          glyph: 'solid/sync',
          text: 'Démarrer la réindexation',
          grow: disabled ? '0.5' : '2',
          disabled: disabled,
        });
      },
      form: {
        resetIndex: false,
      },
      quest: function* (quest, form) {},
    },
    finish: {
      form: {},
      quest: function* (quest, form, next) {
        const workshopAPI = quest.getAPI('workshop');

        if (form.resetIndex) {
          yield workshopAPI.resetIndex();
        }

        const desktopId = quest.getDesktop();
        //const desktop = quest.getAPI(desktopId).noThrow();
        let reportData = [];
        for (const table of form.selectedTables) {
          const data = yield workshopAPI.reindexEntitiesFromStorage({
            desktopId,
            type: table,
            status: ['draft', 'trashed', 'archived', 'published'],
            batchSize: 1000,
          });
          if (data && data.length > 0) {
            reportData = reportData.concat(data);
          }
        }

        const session = quest.getSession();
        const filePath = path.join(
          os.tmpdir(),
          `${session}-reindex-report.csv`
        );
        const rows = Papa.unparse(reportData, {delimiter: ';'});

        if (reportData.length !== 0) {
          fs.writeFileSync(filePath, rows);
          const deskAPI = quest.getAPI(desktopId);
          yield deskAPI.downloadFile({filePath, openFile: true});
        }
        yield quest.me.next();
      },
    },
  },
};

module.exports = buildWizard(config);
