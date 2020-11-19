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
        const profile = quest.goblin.getX('configuration');
        if (form.get('host')) {
          const host = form.get('host');
          let r;
          let config = {
            id: `${entityStorage}@${profile.mandate}`,
            desktopId: `system@${profile.mandate}`,
            host,
            database: form.get('fromDb') || null,
          };
          if (host !== profile.rethinkdbHost) {
            config.id = `${entityStorage}@copy-table-wizard`;
            quest.defer(function* () {
              yield quest.kill([config.id]);
            });
          }
          r = yield quest.create(config.id, {
            ...config,
          });
          quest.goblin.setX('dbConfig', config);
          const databases = yield r.listDb();
          yield quest.me.prepare({form: {databases}});
          if (form.get('fromDb')) {
            const tableList = yield r.listTableFromDb({
              fromDb: form.get('fromDb'),
            });
            quest.me.useTablesTable({
              action: 'setData',
              payload: {data: buildTableList(tableList)},
            });
          }
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
      form: {selectedIds: [], databases: []},
      quest: function* (quest, form) {
        if (!quest.goblin.getX('configuration')) {
          const workshopAPI = quest.getAPI('workshop');
          const configuration = yield workshopAPI.getConfiguration();
          quest.goblin.setX('configuration', configuration);
        }
        const hosts = ['lab0.epsitec.ch', 'localhost'];
        quest.do({
          form: {
            ...form,
            hosts: hosts,
          },
        });
      },
    },
    finish: {
      form: {},
      quest: function* (quest, form, next) {
        const dbConfig = quest.goblin.getX('dbConfig');
        const profile = quest.goblin.getX('configuration');
        const destDbId = `${entityStorage}@${profile.mandate}`;
        const sourceDb = yield quest.create(dbConfig.id, {
          id: dbConfig.id,
          desktopId: `system@${profile.mandate}`,
          host: dbConfig.host,
          database: dbConfig.database,
        });
        yield sourceDb.selectDb({database: dbConfig.database});
        // We can use same driver if host is the same
        if (dbConfig.host === profile.rethinkdbHost) {
          for (const table of form.selectedTables) {
            sourceDb.copyTableFromDb(
              {fromDb: dbConfig.database, table, status: ['published']},
              next.parallel()
            );
          }
          yield next.sync();
        } else {
          // Code working with goblin-rethink branch wip/stored-connection
          // const destDb = yield quest.create(destDbId, {
          //   id: destDbId,
          //   desktopId: `system@${profile.mandate}`,
          //   host: profile.rethinkdbHost,
          //   database: profile.mandate,
          // });
          //
          // for (let table of form.selectedTables) {
          //   // Ensure table exist
          //   yield sourceDb.ensureTable({table});
          //   yield destDb.ensureTable({table});
          //   // Get records from source
          //   const records = yield sourceDb.getAll({
          //     table,
          //     status: ['published'],
          //   });
          //   if (records.length > 0) {
          //     let res = yield destDb.query({
          //       query: function (r, dbName, table, records) {
          //         return r.db(dbName).table(table).insert(records);
          //       },
          //       args: [profile.mandate, table, records],
          //     });
          //     quest.log.dbg(
          //       `query executed ! inserted: ${res[0].inserted} / errors: ${res[0].errors}\n`
          //     );
          //   }
          // }
          let recordsByTable = {};
          for (let table of form.selectedTables) {
            // Ensure table exist
            yield sourceDb.ensureTable({table});
            // Get records from source
            recordsByTable[table] = yield sourceDb.getAll({
              table,
              status: ['published'],
            });
          }
          try {
            const destDb = yield quest.create(destDbId, {
              id: destDbId,
              desktopId: `system@${profile.mandate}`,
              host: profile.rethinkdbHost,
              database: profile.mandate,
            });

            yield destDb.selectDb({database: profile.mandate});

            for (let table of form.selectedTables) {
              // Ensure table exist
              yield destDb.ensureTable({table});
              // Insert records in destination
              if (recordsByTable[table].length > 0) {
                let res = yield destDb.query({
                  query: function (r, dbName, table, records) {
                    return r.db(dbName).table(table).insert(records);
                  },
                  args: [profile.mandate, table, recordsByTable[table]],
                });

                quest.log.dbg(
                  `query executed ! inserted: ${res[0].inserted} / errors: ${res[0].errors}\n`
                );
                if (res[0].first_error) {
                  quest.log.dbg(res[0].first_error);
                }
              }
            }
          } finally {
            if (dbConfig.host !== profile.rethinkdbHost) {
              yield quest.kill([dbConfig.id]);
            }
          }
        }
        yield quest.me.next();
      },
    },
  },
};

module.exports = buildWizard(config);
