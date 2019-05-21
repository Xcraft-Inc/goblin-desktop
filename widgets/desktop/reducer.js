//T:2019-02-27
import {fromJS} from 'immutable';

const initialState = fromJS({
  showPrompt: false,
  widgetsCache: {},
});

const WIDGETS_CACHE_LIMIT = 128;

export default (state = initialState, action = {}) => {
  switch (action.type) {
    case 'TOGGLEPROMPT': {
      return state.set('showPrompt', !state.get('showPrompt'));
    }

    /* Limited cache in size to store values for some widgets like for example
     * the ScrollableContainer. Because this cache is limited, it's possible
     * to lose the data at any time.
     */
    case 'WIDGET_CACHE': {
      const id = action.widgetId;
      if (state.has(`widgetsCache.${id}`)) {
        return state.set(`widgetsCache.${id}`, action.value);
      }
      let widgetsCache = state.get('widgetsCache');
      if (widgetsCache.size >= WIDGETS_CACHE_LIMIT) {
        const _id = widgetsCache.keySeq().first();
        state = state.del(`widgetsCache.${_id}`);
      }
      return state.set(`widgetsCache.${id}`, action.value);
    }
  }
  return state;
};
