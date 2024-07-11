'use strict';
//T:2019-02-27

const Goblin = require('xcraft-core-goblin');
const T = require('goblin-nabu/widgets/helpers/t.js');
const common = require('goblin-workshop').common;
const Shredder = require('xcraft-core-shredder');

const {OrderedMap, fromJS} = require('immutable');

const defaultButtons = OrderedMap()
  .set(
    'main',
    fromJS({
      glyph: 'solid/step-forward',
      text: T('Suivant', 'Bouton du wizard'),
      grow: '1',
    })
  )
  .set(
    'cancel',
    fromJS({
      glyph: 'solid/times',
      text: T('Annuler', 'Bouton du wizard'),
      grow: '1',
    })
  );

module.exports = (config) => {
  const {
    name,
    title,
    skills,
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
  const hinterIdsByName = {};
  const hinterWidgetIdsByName = {};
  // Define logic handlers according rc.json
  const logicHandlers = {
    'create': (state, action) => {
      const form = action.get('form');
      const initForm = action.get('initialFormState');
      const mergedInitialForm = Object.assign(initForm || {}, form || {});
      return state.set('', {
        id: action.get('id'),
        step: 'init',
        title: title,
        dialog: dialog || {
          width: '500px',
        },
        gadgets: action.get('wizardGadgets'),
        busy: true,
        buttons: defaultButtons,
        form: mergedInitialForm,
      });
    },
    'init-wizard': (state) => {
      return state.set('step', '_goto').set('nextStep', wizardFlow[1]);
    },
    'buttons': (state, action) => {
      return state.set('buttons', action.get('buttons'));
    },
    'change': (state, action) => {
      return state.set(action.get('path'), action.get('newValue'));
    },
    'apply': (state, action) => {
      return state.mergeDeep(action.get('path', ''), action.get('patch'));
    },
    'back': (state) => {
      const c = state.get('step');
      const cIndex = wizardFlow.indexOf(c);
      if (cIndex === 0) {
        return state;
      }
      const nIndex = cIndex - 1;
      return state.set('step', '_goto').set('nextStep', wizardFlow[nIndex]);
    },
    'next': (state, action) => {
      const c = state.get('step');
      if (c === 'done') {
        return state;
      }

      const cIndex = wizardFlow.indexOf(c);
      if (cIndex === wizardFlow.length - 1) {
        return state.set('result', action.get('result')).set('step', 'done');
      }

      const nIndex = cIndex + 1;
      const nextStep = wizardFlow[nIndex];
      return state.set('nextStep', nextStep).set('step', '_goto');
    },
    'goto': (state, action) => {
      const step = action.get('step');
      return state.set('nextStep', step).set('step', '_goto');
    },
    '_goto': (state) => {
      const nextStep = state.get('nextStep');
      return state.set('step', nextStep).del('nextStep');
    },
    'busy': (state) => {
      return state.set('busy', true);
    },
    'idle': (state) => {
      return state.set('busy', false);
    },
    'cancel': (state) => {
      return state.set('canceled', true).set('step', 'done');
    },
  };

  Goblin.registerQuest(
    goblinName,
    'create',
    function* (quest, desktopId, form, isDialog) {
      const id = quest.goblin.id;
      quest.goblin.setX('desktopId', desktopId);
      quest.goblin.setX('isDialog', isDialog);
      quest.goblin.setX('isDisposing', false);
      const wizardGadgets = {};

      if (gadgets) {
        yield common.createGadgets(quest, goblinName, gadgets, wizardGadgets);
      }
      if (hinters) {
        yield quest.me.createHinters();
      }

      let running = 0;

      quest.goblin.defer(
        quest.sub.local(`*::${quest.goblin.id}.<wizard-tick>`, function* (
          err,
          {msg, resp}
        ) {
          const {calledFrom} = msg.data;
          const isInternal = calledFrom.split('.')[0] === quest.goblin.id;
          if (running > 0 && !isInternal) {
            return; /* Drop this tick because a step is already running */
          }

          try {
            ++running;
            const step = quest.goblin.getState().get('step');
            yield resp.cmd(`${goblinName}.${step}`, {id});
          } finally {
            --running;
          }
        })
      );

      quest.do({id: quest.goblin.id, initialFormState, form, wizardGadgets});
      yield quest.me.initWizard();
      yield quest.me.idle();
      return quest.goblin.id;
    },
    {skills: skills ?? []}
  );

  Goblin.registerQuest(goblinName, 'create-hinters', function* (quest, next) {
    const desktopId = quest.goblin.getX('desktopId');

    if (hinters) {
      const promises = [];
      Object.keys(hinters).forEach((h) => {
        let detailWidget = null;
        let hName = h;
        if (hinters[h].hinter) {
          hName = hinters[h].hinter;
          detailWidget = `${hName}-workitem`;
        }
        if (quest.hasAPI(`${hName}-hinter`)) {
          const id = `${hName}-hinter@${h}@${quest.goblin.id}`;
          const widgetId = `hinter@${hName}@${quest.goblin.id}`;
          hinterIdsByName[h] = id;
          hinterWidgetIdsByName[h] = widgetId;
          promises.push(
            quest.create(`${hName}-hinter`, {
              id,
              desktopId,
              hinterName: h,
              workitemId: quest.goblin.id,
              detailWidget,
              withDetails: true,
            })
          );
        }
      });
      if (promises.length) {
        yield Promise.all(promises);
      }
    }
  });

  common.registerHinters(goblinName, hinters);

  Goblin.registerSafeQuest(goblinName, 'busy', function (quest) {
    quest.do();
  });

  Goblin.registerSafeQuest(goblinName, 'idle', function (quest) {
    quest.do();
  });

  if (gadgets) {
    for (const key of Object.keys(gadgets)) {
      //Gogo gadgeto stylo!
      Goblin.registerSafeQuest(goblinName, `use-${key}`, function* (
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
          const questName = common.jsifyQuestName(`${key}-${handler}`);
          logicHandlers[questName] = gadgets[key].onActions[handler];

          Goblin.registerSafeQuest(goblinName, questName, function* (quest) {
            quest.do();
            yield quest.me.update();
          });
        }
      }
    }
  }

  if (quests) {
    Object.keys(quests).forEach((q) => {
      Goblin.registerSafeQuest(goblinName, q, quests[q]);
    });
  }

  Goblin.registerSafeQuest(goblinName, 'init-wizard', function (quest) {
    quest.do();
    quest.evt('<wizard-tick>', {calledFrom: quest.calledFrom});
  });

  Goblin.registerSafeQuest(goblinName, 'next', function (quest, result) {
    quest.do();
    quest.evt('<wizard-tick>', {calledFrom: quest.calledFrom});
    return result;
  });

  Goblin.registerSafeQuest(goblinName, 'back', function (quest) {
    quest.do();
    quest.evt('<wizard-tick>', {calledFrom: quest.calledFrom});
  });

  Goblin.registerSafeQuest(goblinName, 'goto', function (quest, step) {
    quest.do();
    quest.evt('<wizard-tick>', {calledFrom: quest.calledFrom});
  });

  Goblin.registerSafeQuest(goblinName, '_goto', function* (quest) {
    const state = quest.goblin.getState();
    const form = state.get('form').toJS();
    const nextStep = state.get('nextStep');

    quest.dispatch(`init-${nextStep}`);
    quest.do();

    yield quest.me.updateButtons();

    if (quest.me[nextStep]) {
      try {
        yield quest.me.busy();
        yield quest.me[nextStep]({form});
      } finally {
        if (!quest.goblin.getX('isDisposing')) {
          yield quest.me.idle();
        }
      }
    }
  });

  Goblin.registerSafeQuest(goblinName, 'done', function* (quest) {
    let result = quest.goblin.getState().get('result');
    if (Shredder.isImmutable(result)) {
      result = result.toJS();
    }
    let payload = {finished: true, result};
    if (quest.goblin.getState().get('canceled')) {
      payload = quest.cancel();
    }
    quest.evt('done', payload);
    yield quest.me.dispose();
  });

  Goblin.registerSafeQuest(goblinName, 'cancel', function (quest) {
    quest.do();
    quest.evt('<wizard-tick>', {calledFrom: quest.calledFrom});
  });

  Goblin.registerSafeQuest(goblinName, 'change', function* (
    quest,
    path,
    newValue
  ) {
    if (hinters && hinters[path]) {
      return;
    }
    quest.do();
    yield quest.me.update();
  });

  Goblin.registerSafeQuest(goblinName, 'apply', function* (quest) {
    quest.do();
    yield quest.me.update();
  });

  Goblin.registerSafeQuest(goblinName, 'update', function* (quest) {
    const state = quest.goblin.getState();
    const stepName = state.get('step');
    const step = steps[stepName];

    if (step) {
      if (step.updateButtonsMode === 'onChange') {
        yield quest.me.updateButtons();
      }
      if (step.onChange) {
        const form = state.get('form');
        yield quest.me[`${stepName}OnChange`]({form});
      }
    }
  });

  Goblin.registerSafeQuest(goblinName, 'update-buttons', function* (quest) {
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
    logicHandlers[`init-${stepName}`] = (state) => {
      if (step.form) {
        return state.mergeDeep('form', step.form);
      }
      return state;
    };
    logicHandlers[stepName] = (state, action) => {
      return state.mergeDeep('form', action.get('form'));
    };

    if (step.quest) {
      Goblin.registerSafeQuest(goblinName, stepName, step.quest);
    }

    if (step.buttons) {
      Goblin.registerSafeQuest(goblinName, `${stepName}-buttons`, step.buttons);
    }

    if (step.onChange) {
      Goblin.registerSafeQuest(
        goblinName,
        `${stepName}-on-change`,
        step.onChange
      );
    }

    for (const action in step.actions) {
      const actionQuest = `${stepName}-${action}`;
      logicHandlers[actionQuest] = step.actions[action];
      Goblin.registerSafeQuest(goblinName, actionQuest, function (quest) {
        quest.do();
      });
    }
  }

  Goblin.registerSafeQuest(goblinName, 'get-entity', common.getEntityQuest);
  Goblin.registerSafeQuest(goblinName, 'load-entity', common.loadEntityQuest);
  Goblin.registerSafeQuest(goblinName, 'open-wizard', common.openWizard);

  Goblin.registerSafeQuest(goblinName, 'showHinter', function* (
    quest,
    type,
    withDetail = true
  ) {
    const hinterWidgetId = hinterWidgetIdsByName[type];
    const hinterAPI = quest.getAPI(hinterWidgetId).noThrow();
    yield hinterAPI.show();
    if (withDetail) {
      yield hinterAPI.showDetail();
    }
  });

  Goblin.registerSafeQuest(goblinName, 'hideHinter', function* (quest, type) {
    const hinterAPI = quest
      .getAPI(`${type}-hinter@${quest.goblin.id}`)
      .noThrow();
    yield hinterAPI.hide();
  });

  Goblin.registerSafeQuest(goblinName, 'setDetail', function* (
    quest,
    type,
    entityId
  ) {
    const hinterWidgetId = hinterWidgetIdsByName[type];
    const deskAPI = quest.getAPI(quest.getDesktop()).noThrow();
    yield deskAPI.setDetail({
      hinterId: hinterWidgetId,
    });
    const hinterAPI = quest.getAPI(hinterWidgetId).noThrow();
    yield hinterAPI.setCurrentDetailEntity({entityId});
  });

  function disposeQuest(quest) {
    if (quest.goblin.getX('isDisposing')) {
      return;
    }

    quest.goblin.setX('isDisposing', true);

    const desktopId = quest.goblin.getX('desktopId');

    quest.evt(`${desktopId}.<remove-workitem-requested>`, {
      workitemId: quest.goblin.id,
      close: false,
      navToLastWorkitem: true,
    });
  }

  Goblin.registerSafeQuest(goblinName, 'dispose', disposeQuest);

  Goblin.registerQuest(goblinName, 'delete', function (quest) {
    quest.evt('done', {finished: true});
    disposeQuest(quest);
  });

  return Goblin.configure(goblinName, {}, logicHandlers);
};
