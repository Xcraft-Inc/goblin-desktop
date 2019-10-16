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
        select: (state, action) => {
          return state.set('form.selectedTables', action.get('selectedIds'));
        },
        doubleClick: state => state,
      },
    },
  },
  steps: {
    prepare: {
      onChange: function*(quest, form) {
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
      buttons: function(quest, buttons, form) {
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
      quest: function*(quest, form) {
        const r = quest.getStorage(entityStorage);
        const databases = yield r.listDb();
        quest.do({
          form: {fromTable: null, databases, fromDb: null},
        });
      },
    },
    finish: {
      form: {},
      quest: function*(quest, form, next) {
        const r = quest.getStorage(entityStorage);
        for (const table of form.selectedTables) {
          r.copyTableFromDb({fromDb: form.fromDb, table}, next.parallel());
        }
        yield next.sync();
        if (form.reindex === 'true') {
          const e = quest.getStorage('elastic');
          const {configurations} = require('goblin-workshop').buildEntity;

          for (const table of form.selectedTables) {
            const entityDef = configurations[table];
            if (entityDef && entityDef.indexer) {
              const getInfo = (r, table) => {
                return r
                  .table(table)
                  .pluck('id', {meta: [{summaries: ['info']}, 'type']})
                  .map(function(doc) {
                    return {
                      id: doc('id'),
                      info: doc('meta')('summaries')('info'),
                      type: doc('meta')('type'),
                    };
                  });
              };

              const query = getInfo.toString();
              const args = [table];
              r.query({query, args}, next.parallel());
            }
          }

          const toIndex = yield next.sync();
          if (toIndex && toIndex.length) {
            for (const documents of toIndex) {
              for (const doc of documents) {
                const indexed = {
                  searchAutocomplete: doc.info,
                  searchPhonetic: doc.info,
                  info: doc.info,
                };

                const index = {
                  documentId: doc.id,
                  type: doc.type,
                  document: indexed,
                };
                e.index(index, next.parallel());
              }
              yield next.sync();
            }
          }
        }

        yield quest.me.next();
      },
    },
  },
};

module.exports = buildWizard(config);
