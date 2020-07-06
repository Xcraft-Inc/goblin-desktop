import React from 'react';
import Widget from 'goblin-laboratory/widgets/widget';
import T from 't';
import MainTabMenu from 'goblin-desktop/widgets/main-tab-menu/widget';

/******************************************************************************/

class DesktopThemesMenuNC extends Widget {
  constructor() {
    super(...arguments);

    this.onChangeTheme = this.onChangeTheme.bind(this);
  }

  onChangeTheme(name) {
    this.doAs('desktop', 'change-theme', {name});
  }

  render() {
    const {currentTheme, themes, accessToEggsThemes} = this.props;

    const glyph = accessToEggsThemes ? 'regular/tint' : 'solid/tint';

    return (
      <MainTabMenu
        glyph={glyph}
        kind="main-tab-right"
        tooltip={T('Choix du thème')}
        items={themes}
        currentItemValue={currentTheme}
        onChange={this.onChangeTheme}
      />
    );
  }
}

/******************************************************************************/

const DesktopThemesMenu = Widget.connect((state) => {
  const userSession = Widget.getUserSession(state);
  const accessToEggsThemes = userSession.get('accessToEggsThemes') || false;

  const currentTheme = state.get(`backend.${window.labId}.theme`);
  const themeContext = state.get(`backend.${window.labId}.themeContext`);

  const themes = Array.from(
    state.get(`backend.theme-composer@${themeContext}.themes`).keys()
  )
    .sort()
    .map((key) => {
      const meta = state.get(
        `backend.theme-composer@${themeContext}.themes.${key}.meta`
      );
      const additionalInfo = {
        glyph: key === currentTheme ? 'solid/tint' : 'regular/tint',
      };
      if (meta) {
        const isEgg = meta.get('egg', false);
        if (isEgg && !accessToEggsThemes) {
          return null;
        }
        const glyph = meta.get('glyph', null);
        if (glyph) {
          additionalInfo.glyph = glyph;
        }
      }
      return {text: key, value: key, ...additionalInfo};
    })
    .filter((t) => !!t);

  return {themeContext, currentTheme, themes, accessToEggsThemes};
})(DesktopThemesMenuNC);

export default DesktopThemesMenu;
