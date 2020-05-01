'use strict';
//T:2019-02-27

const T = require('goblin-nabu');
const {buildWizard} = require('goblin-desktop');

const config = {
  name: 'edit-by-id',
  title: T('Editer depuis un identifiant'),
  dialog: {
    width: '500px',
  },
  steps: {
    prepare: {
      updateButtonsMode: 'onChange',
      buttons: function*(quest, buttons, form) {
        const entityId = form.get('entityId');

        let text = T('Ouvrir');
        //check id validity
        let disabled = !entityId;

        //check id chars
        if (!disabled) {
          //TODO: methodify in workshop
          const validIdChars = RegExp('^[A-Za-z0-9-]+@[A-Za-z0-9-@]+$');
          if (!validIdChars.test(entityId)) {
            disabled = true;
            text = T(`L'identifiant n'est pas valide`);
          }
        }

        //check workitem->type service exist
        if (!disabled) {
          const type = entityId.split('@')[0];
          const exist = quest.hasAPI(`${type}-workitem`);
          if (!exist) {
            disabled = true;
            text = T(`Type d'entité inconnu`);
          }
        }

        //check entity exist
        if (!disabled) {
          const type = entityId.split('@')[0];
          const r = quest.getStorage('rethink');
          const exist = yield r.exist({table: type, documentId: entityId});
          if (!exist) {
            disabled = true;
            text = T(`L'entité n'existe pas`);
          }
        }

        return buttons.set('main', {
          glyph: 'solid/plus',
          text,
          grow: '2',
          disabled: disabled,
        });
      },
      form: {entityId: ''},
    },
    finish: {
      form: {},
      quest: function*(quest, form) {
        const deskAPI = quest.getAPI(quest.getDesktop());
        const entityId = form.entityId;
        const type = entityId.split('@')[0];
        yield deskAPI.addWorkitem({
          workitem: {
            view: 'default',
            kind: 'tab',
            name: type + '-workitem',
            payload: {
              entityId,
            },
          },
        });
        yield quest.me.next();
      },
    },
  },
};

module.exports = buildWizard(config);
