'use strict';
const Goblin = require('xcraft-core-goblin');

function jsifyQuestName(quest) {
  return quest.replace(/-([a-z])/g, (m, g1) => g1.toUpperCase());
}

module.exports = config => {
  const {name, title, dialog, steps, gadgets, initialFormState} = config;
  const goblinName = `${name}-wizard`;
  const wizardSteps = Object.keys(steps);
  const wizardFlow = ['init'].concat(wizardSteps);

  // Define logic handlers according rc.json
  const logicHandlers = {
    create: (state, action) => {
      const form = action.get('form');
      const initForm = action.get('initialFormState');
      const mergedInitialForm = Object.assign(initForm || {}, form || {});
      return state.set('', {
        id: action.get('id'),
        step: 'init',
        title: title,
        dialog: dialog || {
          width: '500px',
          height: '400px',
        },
        gadgets: action.get('wizardGadgets'),
        busy: true,
        mainButton: {
          glyph: 'solid/step-forward',
          text: 'Suivant',
          grow: '1',
          disabled: 'false',
        },
        form: mergedInitialForm,
      });
    },
    'main-button': (state, action) => {
      return state.set('mainButton', action.get('mainButton'));
    },
    submit: (state, action) => {
      return state.applyForm(action.get('value'));
    },
    change: (state, action) => {
      return state.set(action.get('path'), action.get('newValue'));
    },
    next: (state, action) => {
      return state.set('step', action.get('step'));
    },
    busy: state => {
      return state.set('busy', !state.get('busy'));
    },
  };

  Goblin.registerQuest(goblinName, 'create', function*(quest, desktopId, form) {
    quest.goblin.setX('desktopId', desktopId);
    const wizardGadgets = {};
    if (gadgets) {
      for (const key of Object.keys(gadgets)) {
        const gadget = gadgets[key];
        const newGadgetId = `${gadget.type}@${quest.goblin.id}`;
        wizardGadgets[key] = {id: newGadgetId, type: gadget.type};
        if (gadgets[key].onActions) {
          for (const handler of Object.keys(gadgets[key].onActions)) {
            quest.goblin.defer(
              quest.sub(`${newGadgetId}.${handler}`, (err, msg) =>
                quest.me[jsifyQuestName(`${key}-${handler}`)](msg.data)
              )
            );
          }
        }
        quest.create(`${gadget.type}-gadget`, {
          id: newGadgetId,
          options: gadget.options || null,
        });
      }
    }

    quest.do({id: quest.goblin.id, initialFormState, form, wizardGadgets});
    yield quest.me.init();
    quest.me.busy();
    return quest.goblin.id;
  });

  Goblin.registerQuest(goblinName, 'busy', function(quest) {
    quest.do();
  });

  if (gadgets) {
    for (const key of Object.keys(gadgets)) {
      //Gogo gadgeto stylo!
      Goblin.registerQuest(goblinName, `use-${key}`, function*(
        quest,
        action,
        payload
      ) {
        const gadgetId = quest.goblin.getState().get(`gadgets.${key}.id`);
        const api = quest.getAPI(gadgetId);
        yield api[action](payload);
      });

      //Register gagdet quest handlers

      if (gadgets[key].onActions) {
        for (const handler of Object.keys(gadgets[key].onActions)) {
          logicHandlers[`${key}-${handler}`] = gadgets[key].onActions[handler];

          Goblin.registerQuest(goblinName, `${key}-${handler}`, function(
            quest
          ) {
            quest.do();
            quest.me.update();
          });
        }
      }
    }
  }

  Goblin.registerQuest(goblinName, 'init', function*(quest) {
    const nextStep = wizardFlow[1];
    quest.me.busy();
    quest.dispatch(`init-${nextStep}`);

    const form = quest.goblin
      .getState()
      .get('form')
      .toJS();

    const mb = `${nextStep}MainButton`;
    if (quest.me[mb]) {
      const mainButton = yield quest.me[mb]({form});
      quest.dispatch('main-button', {mainButton});
    }

    yield quest.me[nextStep]({form});
    quest.dispatch('next', {step: nextStep});
    quest.me.busy();
  });

  Goblin.registerQuest(goblinName, 'next', function*(quest) {
    const c = quest.goblin.getState().get('step');
    const cIndex = wizardFlow.indexOf(c);
    if (cIndex === wizardFlow.length - 1) {
      return;
    }
    const nIndex = cIndex + 1;
    const nextStep = wizardFlow[nIndex];
    quest.me.busy();
    quest.dispatch(`init-${nextStep}`);

    const form = quest.goblin
      .getState()
      .get('form')
      .toJS();

    const mb = `${nextStep}MainButton`;
    if (quest.me[mb]) {
      const mainButton = yield quest.me[mb]({form});
      quest.dispatch('main-button', {mainButton});
    }

    yield quest.me[nextStep]({form});
    quest.do({step: wizardFlow[nIndex]});
    quest.me.busy();
  });

  Goblin.registerQuest(goblinName, 'cancel', function(quest) {
    const desktopId = quest.goblin.getX('desktopId');
    const desk = quest.getAPI(desktopId);
    desk.removeDialog({dialogId: quest.goblin.id});
  });

  Goblin.registerQuest(goblinName, 'change', function*(quest) {
    quest.do();
    yield quest.me.update();
  });

  Goblin.registerQuest(goblinName, 'update', function*(quest) {
    const c = quest.goblin.getState().get('step');
    const form = quest.goblin
      .getState()
      .get('form')
      .toJS();

    if (steps[c] && steps[c].mainButton) {
      const mainButton = yield quest.me[`${c}MainButton`]({form});
      quest.dispatch('main-button', {mainButton});
    }
  });

  // configure steps
  for (const stepName of wizardSteps) {
    const step = steps[stepName];
    logicHandlers[`init-${stepName}`] = state => {
      if (step.form) {
        return state.merge('form', step.form);
      }
    };
    logicHandlers[stepName] = (state, action) => {
      return state.merge('form', action.get('form'));
    };
    Goblin.registerQuest(goblinName, stepName, step.quest);

    if (step.mainButton) {
      Goblin.registerQuest(
        goblinName,
        `${stepName}-main-button`,
        step.mainButton
      );
    }

    for (const action in step.actions) {
      const actionQuest = `${stepName}-${action}`;
      logicHandlers[actionQuest] = step.actions[action];
      Goblin.registerQuest(goblinName, actionQuest, function(quest) {
        quest.do();
      });
    }
  }

  Goblin.registerQuest(goblinName, 'delete', function(quest) {});

  return Goblin.configure(goblinName, {}, logicHandlers);
};
