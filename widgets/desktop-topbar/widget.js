//T:2019-02-27
import React from 'react';
import Widget from 'goblin-laboratory/widgets/widget';
import T from 't';
import importer from 'goblin_importer';
import Container from 'goblin-gadgets/widgets/container/widget';
import Button from 'goblin-gadgets/widgets/button/widget';
import MainTabMenu from 'goblin-desktop/widgets/main-tab-menu/widget';
import RetroPanel from 'goblin-gadgets/widgets/retro-panel/widget';
import {ColorManipulator} from 'electrum-theme';
const viewImporter = importer('view');

/******************************************************************************/

/*let currentTheme = 'default';
const themes = [
  {text: T('Standard'), value: 'default'},
  {text: T('Standard compact'), value: 'default-compact'},
  {text: T('Vert'), value: 'default-green'},
  {text: T('Vert spécial'), value: 'special-green'},
  {text: T('Vert arrondi'), value: 'smooth-green'},
  {text: T('Rouge'), value: 'default-red'},
  {text: T('Rose'), value: 'default-pink'},
  {text: T('Rose compact'), value: 'compact-pink'},
  {text: T('Monochrome compact'), value: 'compact-mono'},
  {text: T('Foncé'), value: 'default-dark'},
  {text: T('Dragula'), value: 'default-dragula'},
];
const eggsThemes = [
  ...themes,
  {separator: true, separatorKind: 'menu-line'},
  {glyph: 'solid/crown', text: T('Royal'), value: 'royal'},
  {glyph: 'solid/clock', text: T('Clock'), value: 'clock'},
  {glyph: 'solid/car', text: T('Oldtimer'), value: 'oldtimer'},
  {glyph: 'solid/tachometer', text: T('Steampunk'), value: 'steampunk'},
];*/

class ThemesMenuNC extends Widget {
  render() {
    const {
      currentTheme,
      themes,
      accessToEggsThemes,
      onChangeTheme,
    } = this.props;
    const glyph = accessToEggsThemes ? 'regular/tint' : 'solid/tint';

    return (
      <MainTabMenu
        glyph={glyph}
        kind="main-tab-right"
        tooltip={T('Choix du thème')}
        items={themes}
        currentItemValue={currentTheme}
        onChange={onChangeTheme}
      />
    );
  }
}

const ThemesMenu = Widget.connect((state, props) => {
  const {accessToEggsThemes} = props;
  const currentTheme = state.get(`backend.${window.labId}.theme`);
  const themeContext = state.get(`backend.${window.labId}.themeContext`);
  const themes = Array.from(
    state.get(`backend.theme-composer@${themeContext}.themes`).keys()
  )
    .sort()
    .map((theme) => {
      const meta = state.get(
        `backend.theme-composer@${themeContext}.themes.${theme}.meta`
      );
      const additionalInfo = {};
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
      return {text: theme, value: theme, ...additionalInfo};
    })
    .filter((t) => !!t);
  return {themeContext, currentTheme, themes};
})(ThemesMenuNC);

/******************************************************************************/

const LocaleMenuConnected = Widget.connect((state, props) => {
  const locales = state.get(`backend.nabu.locales`);
  const localeId = Widget.getUserSession(state).get('locale');

  return {
    items: locales,
    itemsTextKey: 'text',
    itemsValueKey: 'name',
    currentItemValue: localeId,
  };
})(MainTabMenu);

const TeamSelector = Widget.connect((state, props) => {
  const teamIds = state.get('backend.mandate@main.teamIds');
  if (!teamIds) {
    return {
      items: [{text: 'non configuré', value: null}],
      currentItemValue: null,
    };
  }
  const currentTeam = state.get(
    `backend.${props.desktopId}.teamId`,
    teamIds.get(0)
  );
  const items = teamIds.reduce((items, id) => {
    const item = state.get(`backend.${id}`);
    if (item) {
      items.push({text: item.get('name'), value: id});
    }
    return items;
  }, []);
  return {
    items,
    currentItemValue: currentTeam,
  };
})(MainTabMenu);

const UserInfo = Widget.connect((state, props) => {
  const teamIds = state.get('backend.mandate@main.teamIds');
  if (!teamIds) {
    return {
      text: `${props.user}`,
      kind: 'main-tab-right',
    };
  }
  const currentTeam = state.get(
    `backend.${props.desktopId}.teamId`,
    teamIds.get(0)
  );
  const team = state.get(`backend.${currentTeam}.alias`, '');
  return {
    text: `${props.user} ${team}`,
    kind: 'main-tab-right',
  };
})(Button);

/******************************************************************************/

export default class DesktopTopbar extends Widget {
  constructor() {
    super(...arguments);

    this.state = {
      accessToEggsThemes: false,
    };

    this.onChangeScreen = this.onChangeScreen.bind(this);
    this.onChangeLocale = this.onChangeLocale.bind(this);
    this.onChangeTheme = this.onChangeTheme.bind(this);
    this.onChangeEggs = this.onChangeEggs.bind(this);
    this.onChangeTeam = this.onChangeTeam.bind(this);
  }

  //#region get/set
  get accessToEggsThemes() {
    return this.state.accessToEggsThemes;
  }

  set accessToEggsThemes(value) {
    this.setState({
      accessToEggsThemes: value,
    });
  }
  //#endregion

  onChangeScreen() {
    this.doAs('desktop', 'change-screen');
  }

  onChangeLocale(locale) {
    this.doAs('desktop', 'change-locale', {locale});
  }

  onChangeTheme(name) {
    this.doAs('desktop', 'change-theme', {name});
  }

  onChangeEggs() {
    this.accessToEggsThemes = true;
  }

  onChangeTeam(teamId) {
    this.doAs('desktop', 'change-team', {teamId});
  }

  /******************************************************************************/

  renderUserPart() {
    return (
      <React.Fragment>
        <UserInfo user={this.props.username} desktopId={this.props.id} />
        <TeamSelector
          desktopId={this.props.id}
          glyph="solid/users"
          kind="main-tab-right"
          tooltip="Team"
          onChange={this.onChangeTeam}
        />
        <LocaleMenuConnected
          glyph="solid/flag"
          kind="main-tab-right"
          tooltip={T('Choix de la locale')}
          onChange={this.onChangeLocale}
          desktopId={this.props.id}
        />
        <ThemesMenu
          accessToEggsTheme={this.accessToEggsThemes}
          onChangeTheme={this.onChangeTheme}
        />
        <div
          className={this.styles.classNames.eggButton}
          onClick={this.onChangeEggs}
        />
        <Button
          glyph="solid/tv"
          kind="main-tab-right"
          onClick={this.onChangeScreen}
        />
        {window.zoomable ? (
          <Button
            glyph="solid/plus"
            kind="main-tab-right"
            tooltip={T('Augmente le zoom')}
            onClick={() => {
              this.doFor(this.context.labId, 'zoom');
            }}
          />
        ) : null}
        {window.zoomable ? (
          <Button
            text="1"
            kind="main-tab-right"
            tooltip={T('Remet le zoom 100%')}
            onClick={() => {
              this.doFor(this.context.labId, 'default-zoom');
            }}
          />
        ) : null}
        {window.zoomable ? (
          <Button
            glyph="solid/minus"
            kind="main-tab-right"
            tooltip={T('Diminue le zoom')}
            onClick={() => {
              this.doFor(this.context.labId, 'un-zoom');
            }}
          />
        ) : null}
      </React.Fragment>
    );
  }

  renderUserUI() {
    if (this.context.theme.look.name === 'retro') {
      return (
        <RetroPanel
          position="relative"
          height="54px"
          kind="metal-plate"
          margin="3px"
          padding="0px 20px"
          radius="12px"
          flexDirection="row"
          justifyContent="center"
          alignItems="center"
          fillColor={ColorManipulator.darken(
            this.context.theme.palette.light,
            0.2
          )}
          strokeColor={ColorManipulator.darken(
            this.context.theme.palette.light,
            0.5
          )}
        >
          {this.renderUserPart()}
        </RetroPanel>
      );
    } else {
      return (
        <Container kind="main-tab-right">{this.renderUserPart()}</Container>
      );
    }
  }

  render() {
    const routes = this.props.routes;
    const topbarView = viewImporter(routes['/top-bar/'].component);
    const TopBar = Widget.WithRoute(
      topbarView,
      'context'
    )(routes['/top-bar/'].path);

    return (
      <Container kind="top-bar">
        <TopBar desktopId={this.props.id} />
        {this.renderUserUI()}
      </Container>
    );
  }
}

/******************************************************************************/
