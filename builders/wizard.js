'use strict';
const Goblin = require('xcraft-core-goblin');

module.exports = config => {
  const {name, title, steps} = config;
  const goblinName = `${name}-wizard`;
  const wizardSteps = Object.keys(steps);
  const wizardFlow = ['init'].concat(wizardSteps);

  // Define logic handlers according rc.json
  const logicHandlers = {
    create: (state, action) => {
      const form = action.get('form');
      return state.set('', {
        id: action.get('id'),
        step: 'init',
        title: title,
        busy: true,
        form: form ? form : {},
      });
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
    quest.do({id: quest.goblin.id, form});
    yield quest.me.init();
    quest.me.busy();
    return quest.goblin.id;
  });

  Goblin.registerQuest(goblinName, 'busy', function(quest) {
    quest.do();
  });

  Goblin.registerQuest(goblinName, 'init', function*(quest) {
    const nextStep = wizardFlow[1];
    quest.me.busy();
    quest.dispatch(`init-${nextStep}`);

    const form = quest.goblin
      .getState()
      .get('form')
      .toJS();

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

    yield quest.me[nextStep]({form});
    quest.do({step: wizardFlow[nIndex]});
    quest.me.busy();
  });

  Goblin.registerQuest(goblinName, 'submit', function(quest) {
    quest.do();
  });

  Goblin.registerQuest(goblinName, 'change', function(quest) {
    quest.do();
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
