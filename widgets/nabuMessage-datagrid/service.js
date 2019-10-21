'use strict';
//T:2019-02-27

const T = require('goblin-nabu/widgets/helpers/t.js');
const watt = require('gigawatts');
const {buildWorkitem} = require('goblin-workshop');
const {getToolbarId} = require('goblin-nabu/lib/helpers.js');

function isEmptyOrSpaces(str) {
  return !str || str.length === 0 || /^\s*$/.test(str);
}

const config = {
  type: 'nabuMessage',
  kind: 'datagrid',
  initialState: {
    hasTranslations: {},
  },
  dialog: {
    height: '700px',
  },
  listStatus: ['draft', 'published'],
  listOrderBy: 'value.keyword',
  listType: 'uniform',
  createMissingDrillDownEntities: true,
  columns: [
    {
      name: 'missingTranslations',
      width: '40px',
    },
    {
      name: 'nabuId',
      field: 'nabuId',
      sortable: true,
      sortKey: 'value.keyword',
      customSort: true,
    },
    {
      name: 'locale_1',
      sortable: true,
      customSort: true,
    },
    {
      name: 'locale_2',
      sortable: true,
      customSort: true,
    },
    {
      name: 'openExtern',
      width: '40px',
    },
  ],
  hinter: {
    type: 'nabuMessage',
    subTypes: ['nabuTranslation'],
    subJoins: ['messageId'],
    field: 'id',
    fields: ['info'],
    title: T('Messages'),
  },
  afterCreate: function*(quest, next) {
    // Setting correct selected locales
    const nabuApi = quest.getAPI('nabu');
    const locales = (yield nabuApi.get()).get('locales');

    //FIXME: find current user locale in ctx
    var firstLocale = locales.size > 0 ? `${locales.first().get('name')}` : '';
    var secondLocale = locales.size > 1 ? `${locales.get(1).get('name')}` : '';

    var firstColumn = firstLocale;

    var secondColumn = firstColumn === firstLocale ? secondLocale : firstLocale;

    yield quest.me.apply({
      path: 'columns[2]',
      patch: {field: firstColumn, sortKey: `${firstColumn}-value.keyword`},
      muteChanged: true,
    });

    yield quest.me.apply({
      path: 'columns[3]',
      patch: {field: secondColumn, sortKey: `${secondColumn}-value.keyword`},
      muteChanged: true,
    });

    yield quest.me.change({
      path: `searchValue`,
      newValue: '',
    });

    yield quest.me.setNeedTranslation();
  },
  quests: {
    openSingleEntity: function(quest, entityId) {
      const toolbarApi = quest.getAPI(getToolbarId(quest.me.id));
      toolbarApi.openSingleEntity({entityId});
    },
    changeSelectedLocale: function*(quest, index, locale, next) {
      const currentLocale = quest.goblin
        .getState()
        .get(`columns[${index}].field`);

      if (currentLocale === locale) {
        return;
      }

      yield quest.me.apply({
        path: `columns[${index}]`,
        patch: {field: locale, sortKey: `${locale}-value.keyword`},
      });

      const sort = quest.goblin.getState().get('sort');

      if (sort.get('key') === currentLocale) {
        yield quest.me.resetListVisualization();
      }

      yield quest.me.setNeedTranslation();
    },
    applyElasticVisualization: function*(quest, value, sort, next) {
      if (value === undefined) {
        yield quest.me.toggleSort({field: sort}, next);
        return;
      }

      yield quest.me.change({
        path: `searchValue`,
        newValue: value,
      });

      if (isEmptyOrSpaces(value)) {
        yield quest.me.resetListVisualization();
        return;
      }

      yield quest.me.changeData();
    },
    setNeedTranslation: function*(quest) {
      const getNrTranslaton = watt(function*() {
        const getTranslationQuery = (r, localeName) => {
          return r.table('nabuTranslation').filter(
            r
              .row('locale')
              .match(localeName)
              .and(
                r
                  .row('text')
                  .match('.')
                  .not()
              )
          );
        };

        const r = quest.getStorage('rethink');
        const query = getTranslationQuery.toString();

        const nabuApi = quest.getAPI('nabu');
        const locales = (yield nabuApi.get()).get('locales');
        const nrLocales = locales.size;
        let i = 0;
        let needTranslation = {};
        while (i < nrLocales) {
          const locale = locales.get(i);

          const args = [locale.get('name')];
          const localTranslation = yield r.query({query, args});

          let value = false;
          if (localTranslation.length > 0) {
            value = true;
          }

          needTranslation[locale.get('name')] = value;

          i++;
        }

        return needTranslation;
      });

      const toChange = yield getNrTranslaton();

      yield quest.me.change({
        path: 'hasTranslations',
        newValue: toChange,
      });
    },
  },
};

module.exports = buildWorkitem(config);
