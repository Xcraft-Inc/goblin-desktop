import React from 'react';
import Widget from 'goblin-laboratory/widgets/widget';
import T from 't';
import MainTabMenu from 'goblin-desktop/widgets/main-tab-menu/widget';

/******************************************************************************/

function compareThemes(t1, t2) {
  const s1 = t1.text;
  const s2 = t2.text;

  if (s1 < s2) {
    return -1;
  }
  if (s1 > s2) {
    return 1;
  }
  return 0;
}

function pushThemes(result, state, isEggs) {
  const a = [];

  for (const key of Array.from(state.keys())) {
    const additionalInfo = {
      glyph: 'solid/tint',
    };
    const meta = state.get(`${key}.meta`, null);
    let egg = false;
    let glyph = null;
    let glyphColor = null;
    if (meta) {
      egg = meta.get('egg', false);
      glyph = meta.get('glyph', null);
      glyphColor = meta.get('glyphColor', null);
    }
    if (egg === isEggs) {
      if (glyph) {
        additionalInfo.glyph = glyph;
      }
      if (glyphColor) {
        additionalInfo.glyphColor = glyphColor;
      }
      const displayName = state.get(`${key}.displayName`) || key;
      a.push({text: displayName, value: key, ...additionalInfo});
    }
  }

  a.sort((t1, t2) => compareThemes(t1, t2));

  for (const item of a) {
    result.push(item);
  }
}

function getThemes(state, accessToEggsThemes) {
  const result = [];

  // Push standards themes.
  pushThemes(result, state, false);

  if (accessToEggsThemes) {
    // Push horizontal separator...
    result.push({separator: true, kind: 'menu-line'});
    // ...then eggs themes.
    pushThemes(result, state, true);
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
    accessToEggsThemes
  );

  return {themeContext, currentTheme, themes, accessToEggsThemes};
})(DesktopThemesMenuNC);

export default DesktopThemesMenu;
