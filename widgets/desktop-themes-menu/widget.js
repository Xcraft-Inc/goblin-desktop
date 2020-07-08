import React from 'react';
import Widget from 'goblin-laboratory/widgets/widget';
import T from 't';
import MainTabMenu from 'goblin-desktop/widgets/main-tab-menu/widget';

/******************************************************************************/

function getEggsThemes(result, state, currentTheme, isEggs) {
  const arrayKeys = Array.from(state.keys());
  for (const key of arrayKeys.sort()) {
    const additionalInfo = {
      glyph: key === currentTheme ? 'solid/tint' : 'regular/tint',
    };
    const egg = state.get(`${key}.meta.egg`, false);
    if (egg === isEggs) {
      const glyph = state.get(`${key}.meta.glyph`, null);
      if (glyph) {
        additionalInfo.glyph = glyph;
      }
      result.push({text: key, value: key, ...additionalInfo});
    }
  }
}

function getThemes(state, currentTheme, accessToEggsThemes) {
  const result = [];

  // Push standards themes.
  getEggsThemes(result, state, currentTheme, false);

  if (accessToEggsThemes) {
    // Push horizontal separator...
    result.push({separator: true, kind: 'menu-line'});
    // ...then eggs themes.
    getEggsThemes(result, state, currentTheme, true);
  }

  return result;
}

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
  const themeContext = state.get(`backend.${window.labId}.themeContext`);
  const currentTheme = state.get(`backend.${window.labId}.theme`);

  const userSession = Widget.getUserSession(state);
  const accessToEggsThemes = userSession.get('accessToEggsThemes') || false;

  const themes = getThemes(
    state.get(`backend.theme-composer@${themeContext}.themes`),
    currentTheme,
    accessToEggsThemes
  );

  return {themeContext, currentTheme, themes, accessToEggsThemes};
})(DesktopThemesMenuNC);

export default DesktopThemesMenu;
