'use strict';
//T:2019-02-27

const T = require('goblin-nabu');
const {buildWizard} = require('goblin-desktop');

const config = {
  name: 'quest-run',
  title: T('Quest Run'),
  dialog: {
    width: '500px',
  },
  steps: {
    prepare: {
      form: {payload: '{}', quest: ''},
      quest: function () {},
    },
    finish: {
      form: {},
      quest: function* (quest, form) {
        const formatted = form.payload
          .replace(
            /(\w+:)|(\w+ :)/g,
            (match) => `"${match.substring(0, match.length - 1)}":`
          )
          .replace(
            /('\w+')/g,
            (match) => `"${match.substring(1, match.length - 1)}"`
          );
        const payload = Object.assign(
          {
            desktopId: quest.getDesktop(),
          },
          JSON.parse(formatted)
        );
        quest.log.dbg(`Running ${form.quest} with ${JSON.stringify(payload)}`);
        yield quest.cmd(form.quest, payload);
        yield quest.me.next();
      },
    },
    close: {
      quest: function* (quest) {
        yield quest.me.next();
      },
    },
  },
};

module.exports = buildWizard(config);
