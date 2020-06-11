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
  name: 'copy-table',
  title: T('Copie de tables'),
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
    prepare: {
      onChange: function* (quest, form) {
        const r = quest.getStorage(entityStorage);
        if (form.get('fromDb')) {
          const tableList = yield r.listTableFromDb({
            fromDb: form.get('fromDb'),
          });
          quest.me.useTablesTable({
            action: 'setData',
            payload: {data: buildTableList(tableList)},
          });
        }
      },
      updateButtonsMode: 'onChange',
      buttons: function (quest, buttons, form) {
        const selectedTables = form.get('selectedTables');
        const disabled =
          !selectedTables || (selectedTables && selectedTables.length < 1);
        return buttons.set('main', {
          glyph: 'solid/plus',
          text: T('Démarrer la réplication'),
          grow: disabled ? '0.5' : '2',
          disabled: disabled,
        });
      },
      form: {selectedIds: []},
      quest: function* (quest, form) {
        const r = quest.getStorage(entityStorage);
        const databases = yield r.listDb();
        quest.do({
          form: {fromTable: null, databases, fromDb: null},
        });
      },
    },
    finish: {
      form: {},
      quest: function* (quest, form, next) {
        const r = quest.getStorage(entityStorage);
        for (const table of form.selectedTables) {
          r.copyTableFromDb(
            {fromDb: form.fromDb, table, status: ['published']},
            next.parallel()
          );
        }
        yield next.sync();

        yield quest.me.next();
      },
    },
  },
};

module.exports = buildWizard(config);
