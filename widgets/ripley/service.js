'use strict';
//T:2019-02-27

const watt = require('gigawatts');
const path = require('path');
const goblinName = path.basename(module.parent.filename, '.js');

const Goblin = require('xcraft-core-goblin');

// Define initial logic values
const logicState = {
  db: {},
  selected: {
    from: null,
    to: null,
  },
};

// Define logic handlers according rc.json
const logicHandlers = {
  create: (state, action) => {
    return state.set('id', action.get('id'));
  },
  update: (state, action) => {
    return state.set('db', action.get('groupedBranches'));
  },
  select: (state, action) => {
    const type = action.get('type');
    const selected = state.get(`selected.${type}`);
    return state.set(
      `selected.${type}`,
      selected === action.get('selectedId') ? null : action.get('selectedId')
    );
  },
};

Goblin.registerQuest(
  goblinName,
  'create',
  function*(quest) {
    // Subscribe to update of cryo pages
    quest.goblin.defer(
      quest.sub(`*::cryo.updated`, function*() {
        const branches = yield quest.cmd('cryo.branches');
        let groupedBranches = {};
        for (const [key, _] of Object.entries(branches)) {
          const db = key.split('_');
          if (db.length === 2) {
            if (groupedBranches[db[0]]) {
              groupedBranches[db[0]].branches.push(key);
            } else {
              groupedBranches[db[0]] = {branches: [key]};
            }
          }
        }
        yield quest.me.update({groupedBranches});
      })
    );

    // initialize branches by mandate
    const branches = yield quest.cmd('cryo.branches');
    let groupedBranches = {};
    for (const [key, _] of Object.entries(branches)) {
      const db = key.split('_');
      if (db.length === 1) {
        groupedBranches[db[0]] = {branches: []};
      } else if (db.length === 2) {
        if (groupedBranches[db[0]]) {
          groupedBranches[db[0]].branches.push(key);
        } else {
          groupedBranches[db[0]] = {branches: [key]};
        }
      }
    }
    quest.me.update({groupedBranches});

    quest.do();
  },
  ['*::cryo.updated']
);

Goblin.registerQuest(goblinName, 'select', function(quest, type, selectedId) {
  quest.do();
});

Goblin.registerQuest(goblinName, 'update', function(quest, branches) {
  quest.do();
});

Goblin.registerQuest(goblinName, 'delete', function(quest) {});

// Create a Goblin with initial state and handlers
module.exports = Goblin.configure(goblinName, logicState, logicHandlers);
