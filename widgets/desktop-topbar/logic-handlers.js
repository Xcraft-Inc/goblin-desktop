//T:2019-02-27
module.exports = {
  'change-team': (state, action) => {
    return state.set('teamId', action.get('teamId'));
  },
};
