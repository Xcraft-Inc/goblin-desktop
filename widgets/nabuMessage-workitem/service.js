//T:2019-02-27
const {buildWorkitem} = require('goblin-workshop');

const config = {
  type: 'nabuMessage',
  kind: 'workitem',
  quests: {},
  hinters: {
    nabuMessage: {
      onValidate: function*(quest, selection) {
        const nabuMessageApi = quest.getAPI(quest.goblin.getX('entityId'));
        yield nabuMessageApi.setNabuMessageId({entityId: selection.value});
      },
    },
  },
};

module.exports = buildWorkitem(config);
