'use strict';
//T:2019-02-27
const T = require('goblin-nabu/widgets/helpers/t.js');
const {buildWizard} = require('goblin-desktop');
const crypto = require('xcraft-core-utils/lib/crypto.js');

const config = {
  name: 'password',
  title: T('Choisir le nouveau mot de passe'),
  quests: {
    setRandomPassword: function*(quest) {
      const state = quest.goblin.getState();
      const passwordLength = state.get('form.passwordLength');
      const password = crypto.randomPassword(passwordLength);
      yield quest.me.change({
        path: 'form.password',
        newValue: password,
      });
    },
  },
  steps: {
    main: {
      buttons: function(quest, buttons) {
        return buttons.set('main', {
          glyph: 'solid/arrow-right',
          text: T('Valider'),
          grow: '2',
        });
      },
      form: {
        showPassword: 'true',
        passwordLength: '8',
      },
      quest: function(quest) {},
    },
    finish: {
      form: {},
      quest: function*(quest, form) {
        yield quest.me.next({result: form.password});
      },
    },
  },
};

module.exports = buildWizard(config);
