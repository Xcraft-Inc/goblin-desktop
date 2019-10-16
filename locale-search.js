'use strict';
//T:2019-04-09

const T = require('goblin-nabu/widgets/helpers/t.js');
const {buildWorkitem} = require('goblin-workshop');

const config = {
  type: 'locale',
  kind: 'search',
  title: T('Locales'),
  list: 'locale',
  hinters: {
    locale: {
      onValidate: function*(quest, selection) {
        const desk = quest.getAPI(quest.goblin.getX('desktopId'));
        const locale = yield quest.me.getEntity({
          entityId: selection.value,
        });
        yield desk.addWorkitem({
          workitem: {
            name: 'locale-workitem',
            view: 'default',
            icon: 'solid/pencil',
            kind: 'tab',
            isClosable: true,
            payload: {
              entityId: selection.value,
              entity: locale,
            },
          },
          navigate: true,
        });
      },
    },
  },
};

exports.xcraftCommands = function() {
  return buildWorkitem(config);
};
