'use strict';
const {buildWizard} = require('goblin-desktop');
const crypto = require('xcraft-core-utils/lib/crypto.js');

const config = {
  name: 'password',
  title: 'Choisir le nouveau mot de passe',
  initialFormState: {
    passwordLength: '8',
  },
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
          text: 'Valider',
          grow: '2',
        });
      },
      form: {
        showPassword: 'true',
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
