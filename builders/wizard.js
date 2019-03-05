'use strict';

const Goblin = require('xcraft-core-goblin');
const {jsify} = require('xcraft-core-utils').string;
const common = require('goblin-workshop').common;

const {OrderedMap, fromJS} = require('immutable');

const defaultButtons = OrderedMap()
  .set(
    'main',
    fromJS({
      glyph: 'solid/step-forward',
      text: 'Suivant',
      grow: '1',
    })
  )
  .set(
    'cancel',
    fromJS({
      glyph: 'solid/times',
      text: 'Annuler',
      grow: '1',
    })
  );

module.exports = config => {
  const {
    name,
    title,
    dialog,
    steps,
    gadgets,
    quests,
    initialFormState,
    hinters,
  } = config;
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
        buttons: defaultButtons,
        form: mergedInitialForm,
      });
    },
    buttons: (state, action) => {
      return state.set('buttons', action.get('buttons'));
    },
    submit: (state, action) => {
      return state.applyForm(action.get('value'));
    },
    change: (state, action) => {
      return state.set(action.get('path'), action.get('newValue'));
    },
    apply: (state, action) => {
      return state.merge(action.get('path', ''), action.get('patch'));
    },
    next: (state, action) => {
      return state.set('step', action.get('step'));
    },
    busy: state => {
      return state.set('busy', true);
    },
    idle: state => {
      return state.set('busy', false);
    },
  };

  Goblin.registerQuest(
    goblinName,
    'create',
    function*(quest, desktopId, form) {
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
                quest.sub(`${newGadgetId}.${handler}`, function*(err, msg) {
                  const questName = jsify(`${key}-${handler}`);
                  yield quest.me[questName](msg.data);
                })
              );
            }
          }

          yield quest.create(`${gadget.type}-gadget`, {
            id: newGadgetId,
            options: gadget.options || null,
          });
        }
      }
      if (hinters) {
        yield quest.me.createHinters();
      }

      quest.goblin.defer(
        quest.sub(`*::${quest.goblin.id}.step`, function*(err, msg) {
          const {action, ...other} = msg.data;
          yield quest.me[action](other);
        })
      );

      quest.do({id: quest.goblin.id, initialFormState, form, wizardGadgets});
      yield quest.me.initWizard();
      yield quest.me.idle();
      return quest.goblin.id;
    },
    ['*::*.step']
  );

  Goblin.registerQuest(goblinName, 'create-hinters', function*(quest, next) {
    const desktopId = quest.goblin.getX('desktopId');

    if (hinters) {
      Object.keys(hinters).forEach(h => {
        quest.create(
          `${h}-hinter`,
          {
            id: `${h}-finder@${quest.goblin.id}`,
            desktopId,
            workitemId: quest.goblin.id,
            withDetails: true,
          },
          next.parallel()
        );
      });
    }
    yield next.sync();
  });

  common.registerHinters(goblinName, hinters);

  Goblin.registerQuest(goblinName, 'busy', function(quest) {
    quest.do();
  });

  Goblin.registerQuest(goblinName, 'idle', function(quest) {
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

          Goblin.registerQuest(goblinName, `${key}-${handler}`, function*(
            quest
          ) {
            quest.do();
            yield quest.me.update();
          });
        }
      }
    }
  }

  if (quests) {
    Object.keys(quests).forEach(q => {
      Goblin.registerQuest(goblinName, q, quests[q]);
    });
  }

  Goblin.registerQuest(goblinName, 'init-wizard', function(quest) {
    const nextStep = wizardFlow[1];
    quest.evt('step', {action: 'goto', step: nextStep});
  });

  Goblin.registerQuest(goblinName, 'next', function(quest, result) {
    const c = quest.goblin.getState().get('step');
    const cIndex = wizardFlow.indexOf(c);
    if (cIndex === wizardFlow.length - 1) {
      quest.evt('step', {action: 'done', result});
      return result;
    }
    const nIndex = cIndex + 1;
    const nextStep = wizardFlow[nIndex];
    quest.evt('step', {action: 'goto', step: nextStep});
    return result;
  });

  Goblin.registerQuest(goblinName, 'goto', function*(quest, step) {
    yield quest.me.busy(); // Set busy

    quest.dispatch('next', {step});

    let form = quest.goblin
      .getState()
      .get('form')
      .toJS();

    quest.dispatch(`init-${step}`);

    yield quest.me.updateButtons();

    if (quest.me[step]) {
      yield quest.me[step]({form});
    }

    // Moved to the top of goto.
    // The step is used in updateButtons.
    // The quest of the step can use updateButtons without specifying the step.
    //quest.dispatch('next', {step});

    yield quest.me.idle(); // Clear busy
  });

  Goblin.registerQuest(goblinName, 'done', function*(quest, result) {
    const desktopId = quest.goblin.getX('desktopId');
    const desk = quest.getAPI(desktopId);
    yield desk.closeDialog({dialogId: quest.goblin.id});
    quest.evt('done', {finished: true, result});
  });

  Goblin.registerQuest(goblinName, 'cancel', function*(quest) {
    const desktopId = quest.goblin.getX('desktopId');
    const desk = quest.getAPI(desktopId);
    yield desk.closeDialog({dialogId: quest.goblin.id});
    quest.evt('done', quest.cancel());
  });

  Goblin.registerQuest(goblinName, 'change', function*(quest, path, newValue) {
    if (hinters && hinters[path]) {
      return;
    }
    quest.do();
    yield quest.me.update();
  });

  Goblin.registerQuest(goblinName, 'apply', function*(quest) {
    quest.do();
    yield quest.me.update();
  });

  Goblin.registerQuest(goblinName, 'update', function*(quest) {
    const state = quest.goblin.getState();
    const stepName = state.get('step');
    const step = steps[stepName];

    yield quest.me.busy();

    if (step) {
      if (step.updateButtonsMode === 'onChange') {
        yield quest.me.updateButtons();
      }
      if (step.onChange) {
        const form = state.get('form');
        yield quest.me[`${stepName}OnChange`]({form});
      }
    }

    yield quest.me.idle();
  });

  Goblin.registerQuest(goblinName, 'update-buttons', function*(quest) {
    const state = quest.goblin.getState();
    const stepName = state.get('step');
    const step = steps[stepName];

    if (step && step.buttons) {
      const form = state.get('form');
      const currentButtons = state.get('buttons');
      const newButtons = yield quest.me[`${stepName}Buttons`]({
        form,
        buttons: currentButtons,
      });
      quest.dispatch('buttons', {buttons: newButtons});
    }
  });

  // configure steps
  for (const stepName of wizardSteps) {
    const step = steps[stepName];
    logicHandlers[`init-${stepName}`] = state => {
      if (step.form) {
        return state.merge('form', step.form);
      }
      return state;
    };
    logicHandlers[stepName] = (state, action) => {
      return state.merge('form', action.get('form'));
    };

    if (step.quest) {
      Goblin.registerQuest(goblinName, stepName, step.quest);
    }

    if (step.buttons) {
      Goblin.registerQuest(goblinName, `${stepName}-buttons`, step.buttons);
    }

    if (step.onChange) {
      Goblin.registerQuest(goblinName, `${stepName}-on-change`, step.onChange);
    }

    for (const action in step.actions) {
      const actionQuest = `${stepName}-${action}`;
      logicHandlers[actionQuest] = step.actions[action];
      Goblin.registerQuest(goblinName, actionQuest, function(quest) {
        quest.do();
      });
    }
  }

  Goblin.registerQuest(goblinName, 'get-entity', common.getEntityQuest);
  Goblin.registerQuest(goblinName, 'load-entity', common.loadEntityQuest);
  Goblin.registerQuest(goblinName, 'open-wizard', common.openWizard);

  Goblin.registerQuest(goblinName, 'delete', function(quest) {
    quest.evt('done', {finished: true});
  });

  return Goblin.configure(goblinName, {}, logicHandlers);
};
