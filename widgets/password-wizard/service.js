'use strict';
const {buildWizard} = require('goblin-desktop');

const chars = [
  'abcdefghijkmnopqrstuvwxyz',
  'ABCDEFGHJKLMNPQRSTUVWXYZ',
  '@+-=*&%?!_',
  '23456789',
];

const config = {
  name: 'password',
  title: 'Choisir le nouveau mot de passe',
  quests: {
    createRandomPassword: function*(quest, form) {
      const state = quest.goblin.getState();
      const passwordLength = state.get('form.passwordLength');
      let password = '';
      const charsLength = chars.length;
      for (let i = 1; i <= passwordLength; i++) {
        let typeChar = yield quest.me.getRandomInt({max: charsLength});
        let selectedChar = yield quest.me.getRandomInt({
          max: chars[typeChar].length,
        });
        password += chars[typeChar][selectedChar];
      }
      yield quest.me.change({
        path: 'form.password',
        newValue: password,
      });
    },
    getRandomInt: function(quest, max) {
      return Math.floor(Math.random() * Math.floor(max));
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
        passwordLength: '8',
      },
      quest: function(quest) {},
    },
    finish: {
      form: {},
      quest: function*(quest, form, next) {
        yield quest.me.next({result: workitemId, form});
      },
    },
  },
};

module.exports = buildWizard(config);
