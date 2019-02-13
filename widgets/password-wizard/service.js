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
    createRandomPassword: function*(quest, passwordLength) {
      let password = '';
      for (let i = 1; i <= passwordLength; i++) {
        let typeChar = quest.me.getRandomInt(chars.length);
        let selectedChar = quest.me.getRandomInt(chars[typeChar].length);
        password += chars[typeChar][selectedChar];
      }
      yield quest.me.change({
        path: 'form.password',
        newValue: password,
      });
    },
    getRandomInt: function(max) {
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
        password: '',
        showPassword: 'true',
      },
      quest: function(quest) {},
    },
    finish: {
      form: {},
      quest: function*(quest, form, next) {
        const callerAPI = quest.getAPI(form.callerId);
        yield callerAPI.setPassword({password: form.password});
        quest.me.next();
      },
    },
  },
};

module.exports = buildWizard(config);
