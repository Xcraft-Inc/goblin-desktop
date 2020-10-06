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
  name: 'rehydrate-summaries',
  title: T('Réhydratation des descriptions'),
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
          glyph: 'solid/leaf',
          text: 'Démarrer la réhydratation',
          grow: disabled ? '0.5' : '2',
          disabled: disabled,
        });
      },
      form: {
        mustRebuild: false,
        mustCompute: false,
        mustBuildSummaries: true,
        mustIndex: false,
        emitHydrated: false,
        onlyPublished: true,
      },
      quest: function* (quest, form) {},
    },
    finish: {
      form: {},
      quest: function* (quest, form, next) {
        const desktopId = quest.getDesktop();
        const desktop = quest.getAPI(desktopId).noThrow();
        const r = quest.getStorage(entityStorage);
        const tables = form.selectedTables.join(', ');
        const tablesNumber = form.selectedTables.length;
        yield desktop.addNotification({
          notificationId: `notification@${quest.uuidV4()}`,
          glyph: 'solid/download',
          color: 'blue',
          message: T(
            `Recupération des entités {length, plural, one {de la table {tables}} other {des tables: {tables}s}}`,
            null,
            {
              length: tablesNumber,
              tables,
            }
          ),
        });
        for (const table of form.selectedTables) {
          const getInfo = (r, table, onlyPublished) => {
            let q = r.table(table);
            if (onlyPublished === true) {
              q = q.getAll('published', {index: 'status'});
            }
            return q
              .pluck('id', {
                meta: ['rootAggregateId', 'rootAggregatePath', 'type'],
              })
              .map(function (doc) {
                return {
                  id: doc('id'),
                  root: doc('meta')('rootAggregateId'),
                  path: doc('meta')('rootAggregatePath'),
                  type: doc('meta')('type'),
                };
              });
          };

          const query = getInfo.toString();
          const args = [table, form.onlyPublished];
          r.querySync({query, args}, next.parallel());
        }

        const forRehydrate = yield next.sync();
        const hydrateClassifier = forRehydrate.reduce(
          (state, entities) => {
            const roots = entities.filter((entity) => entity.path.length === 0);
            const leefs = entities.filter((entity) => entity.path.length > 0);
            state[0] = state[0].concat(roots);
            leefs.reduce((state, leef) => {
              const lvl = leef.path.length;
              if (!state[lvl]) {
                state[lvl] = [];
              }
              state[lvl].push(leef);
              return state;
            }, state);
            return state;
          },
          {0: []}
        );
        let totalLength = 0;
        const orderedHydratation = Object.keys(hydrateClassifier).reduce(
          (order, index) => {
            const entities = hydrateClassifier[index];
            totalLength += entities.length;
            order.push(entities);
            return order;
          },
          []
        );
        const reverseHydratation = orderedHydratation.reverse();
        let count = 1;
        const batchSize = 100;
        const progressNotificationId = `notification@${quest.uuidV4()}`;
        yield desktop.addNotification({
          notificationId: `notification@${quest.uuidV4()}`,
          glyph: 'solid/play',
          color: 'blue',
          message: T(
            `Début de l'hydratation {length, plural, one {de la table {tables}} other {des tables: {tables}s}}`,
            null,
            {
              length: tablesNumber,
              tables,
            }
          ),
        });
        for (const [key, entities] of reverseHydratation.entries()) {
          const current = key + 1;
          const total = reverseHydratation.length;
          if (entities.length > 0) {
            for (const entity of entities) {
              const requestId = quest.uuidV4();
              quest.evt('hydrate-entity-requested', {
                desktopId: quest.getDesktop(),
                requestId,
                entityId: entity.id,
                rootAggregateId: entity.root,
                rootAggregatePath: entity.path,
                muteChanged: true,
                muteHydrated: form.emitHydrated === false,
                notify: false,
                options: {
                  rebuildValueCache: form.mustRebuild === true,
                  buildSummaries: form.mustBuildSummaries === true,
                  compute: form.mustCompute === true,
                  index: form.mustIndex === true,
                },
              });
              if (count % batchSize === 0) {
                const progress = (count / totalLength) * 100;
                yield quest.sub.wait(`*::*.${requestId}-hydrate.done`);
                yield desktop.addNotification({
                  notificationId: progressNotificationId,
                  glyph: 'solid/leaf',
                  color: 'blue',
                  //- message: `(${current}/${total}) ${progress.toFixed(0)} %`,
                  current: progress,
                  total: 100,
                });
              }
              count++;
            }
          }
        }

        yield desktop.addNotification({
          notificationId: progressNotificationId,
          glyph: 'solid/beer',
          //- color: 'blue',
          //- message: T(
          //-   `100 % {length, plural, one {de la table hydratée} other {des tables hydratées}}`,
          //-   null,
          //-   {
          //-     length: tablesNumber,
          //-   }
          //- ),
          color: 'green',
          message: T('Réhydratation terminée'),
        });

        yield quest.me.next();
      },
    },
  },
};

module.exports = buildWizard(config);
