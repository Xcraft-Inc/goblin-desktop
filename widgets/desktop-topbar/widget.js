//T:2019-02-27
import React from 'react';
import Widget from 'goblin-laboratory/widgets/widget';
import T from 't';
import importer from 'goblin_importer';
import Container from 'goblin-gadgets/widgets/container/widget';
import Button from 'goblin-gadgets/widgets/button/widget';
import MainTabMenu from 'goblin-desktop/widgets/main-tab-menu/widget';
import RetroPanel from 'goblin-gadgets/widgets/retro-panel/widget';
import DesktopThemesMenu from 'goblin-desktop/widgets/desktop-themes-menu/widget';
import {ColorManipulator} from 'goblin-theme';
const viewImporter = importer('view');

/******************************************************************************/

const LocaleMenuConnected = Widget.connect((state) => {
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

    this.onChangeScreen = this.onChangeScreen.bind(this);
    this.onChangeLocale = this.onChangeLocale.bind(this);
    this.onChangeTeam = this.onChangeTeam.bind(this);
  }

  onChangeScreen() {
    this.doAs('desktop', 'change-screen');
  }

  onChangeLocale(locale) {
    this.doAs('desktop', 'change-locale', {locale});
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
        <DesktopThemesMenu id={this.props.id} />
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
