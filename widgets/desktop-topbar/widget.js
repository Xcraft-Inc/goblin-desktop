//T:2019-02-27
import React from 'react';
import Widget from 'goblin-laboratory/widgets/widget';
import T from 't';
import Container from 'goblin-gadgets/widgets/container/widget';
import Button from 'goblin-gadgets/widgets/button/widget';
import MainTabMenu from 'goblin-desktop/widgets/main-tab-menu/widget';
import RetroPanel from 'goblin-gadgets/widgets/retro-panel/widget';
import DesktopThemesMenu from 'goblin-desktop/widgets/desktop-themes-menu/widget';
import DesktopScale from 'goblin-desktop/widgets/desktop-scale/widget';
import DesktopConnectionStatus from 'goblin-desktop/widgets/desktop-connection-status/widget';
import {ColorManipulator} from 'goblin-theme';
import Contexts from 'goblin-desktop/widgets/contexts/widget.js';

/******************************************************************************/

const LocaleMenuConnected = Widget.connect((state) => {
  const locales = state
    .get(`backend.nabu.locales`)
    .filter((locale) => !locale.get('hide'));
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
      const metaStatus = item.get('meta').get('status');
      if (metaStatus !== 'archived') {
        items.push({text: item.get('name'), value: id});
      }
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

class DesktopTopbarNC extends Widget {
  constructor() {
    super(...arguments);

    this.onChangeScreen = this.onChangeScreen.bind(this);
    this.onChangeLocale = this.onChangeLocale.bind(this);
    this.onChangeTeam = this.onChangeTeam.bind(this);
    this.onTogglePrototypeMode = this.onTogglePrototypeMode.bind(this);
  }

  onChangeScreen() {
    this.doAs('desktop', 'change-screen');
  }

  onChangeLocale(locale) {
    this.doFor(this.props.clientSessionId, 'change-locale', {locale});
  }

  onChangeTeam(teamId) {
    this.doAs('desktop', 'change-team', {teamId});
  }

  onTogglePrototypeMode() {
    this.doFor(this.props.clientSessionId, 'toggle-prototype-mode');
  }

  /******************************************************************************/

  renderUserPart() {
    return (
      <>
        <UserInfo user={this.props.username} desktopId={this.props.id} />
        <TeamSelector
          kind="main-tab-right"
          desktopId={this.props.id}
          glyph="solid/users"
          tooltip="Team"
          onChange={this.onChangeTeam}
        />
        <LocaleMenuConnected
          kind="main-tab-right"
          desktopId={this.props.id}
          glyph="solid/flag"
          tooltip={T('Choix de la locale')}
          onChange={this.onChangeLocale}
        />
        <DesktopThemesMenu id={this.props.id} />
        <Button
          kind="main-tab-right"
          glyph="solid/tv"
          tooltip={T("Change d'écran")}
          onClick={this.onChangeScreen}
        />
        <Button
          kind="main-tab-right"
          glyph={this.props.prototypeMode ? 'solid/vial' : 'solid/shield-check'}
          tooltip={T(
            'Bouclier: mode normal\nEprouvette: travaux en cours (prototype)'
          )}
          onClick={this.onTogglePrototypeMode}
        />
        <DesktopScale id={this.props.id + '$desktop-scale'} />
        <DesktopConnectionStatus
          id={this.props.id + '$desktop-connection-status'}
        />
      </>
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
    return (
      <Container kind="top-bar">
        <Contexts id={`contexts@${this.props.id}`} desktopId={this.props.id} />
        {this.renderUserUI()}
      </Container>
    );
  }
}

/******************************************************************************/

const DesktopTopbar = Widget.connect((state) => {
  const userSession = Widget.getUserSession(state);
  const clientSessionId = userSession.get('id');
  const prototypeMode = userSession.get('prototypeMode');
  return {clientSessionId, prototypeMode};
})(DesktopTopbarNC);

export default DesktopTopbar;
