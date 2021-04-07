//T:2019-02-27
import React from 'react';
import Widget from 'goblin-laboratory/widgets/widget';
import MouseTrap from 'mousetrap';
import Container from 'goblin-gadgets/widgets/container/widget';
import DesktopTaskbar from 'goblin-desktop/widgets/desktop-taskbar/widget.js';
import DesktopTopbar from 'goblin-desktop/widgets/desktop-topbar/widget.js';
import DesktopContent from 'goblin-desktop/widgets/desktop-content/widget.js';
import Tabs from 'goblin-desktop/widgets/tabs/widget.js';
import DesktopNotifications from 'goblin-desktop/widgets/desktop-notifications/widget.js';
import DesktopFooter from 'goblin-desktop/widgets/desktop-footer/widget.js';
import RetroPanel from 'goblin-gadgets/widgets/retro-panel/widget.js';
import {ColorManipulator} from 'goblin-theme';
import NavigatingLayer from '../navigating-layer/widget.js';
import SFX from '../audio/sfx.js';
/******************************************************************************/
class Desktop extends Widget {
  constructor() {
    super(...arguments);

    this.state = {
      showFooter: true,
    };

    this.toggleFooter = this.toggleFooter.bind(this);
    this.openWorkitemWizard = this.openWorkitemWizard.bind(this);
    this.openNewWorkitem = this.openNewWorkitem.bind(this);
  }

  openWorkitemWizard() {
    this.do('open-entity-wizard');
  }

  openNewWorkitem() {
    this.do('openNewWorkitem');
  }

  componentDidMount() {
    super.componentDidMount();
    //- MouseTrap.bind('tab', this.onTab);
    //- MouseTrap.bind('shift+tab', this.onShiftTab);
    MouseTrap.bind('ctrl+o', this.openWorkitemWizard);
    MouseTrap.bind('ctrl+n', this.openNewWorkitem);
    SFX.intro.play();
  }

  componentWillUnmount() {
    super.componentWillUnmount();
    //- MouseTrap.unbind('tab');
    //- MouseTrap.unbind('shift+tab');
    MouseTrap.unbind('ctrl+o');
    MouseTrap.unbind('ctrl+n');
  }

  //#region get/set
  get showFooter() {
    return this.state.showFooter;
  }

  set showFooter(value) {
    this.setState({
      showFooter: value,
    });
  }
  //#endregion

  static get wiring() {
    return {
      id: 'id',
      username: 'username',
    };
  }

  toggleFooter() {
    this.showFooter = !this.showFooter;
  }

  /******************************************************************************/

  renderTopBar() {
    return (
      <DesktopTopbar
        id={this.props.id}
        desktopId={this.props.id}
        username={this.props.username}
      />
    );
  }

  renderNofications() {
    return (
      <DesktopNotifications id={this.props.id} desktopId={this.props.id} />
    );
  }

  renderFooter() {
    return (
      <DesktopFooter
        id={this.props.id}
        desktopId={this.props.id}
        showFooter={this.showFooter}
      />
    );
  }

  renderContent() {
    return <DesktopContent id={this.props.id} desktopId={this.props.id} />;
  }

  renderRetroPanel() {
    if (!this.context.theme.look.homeGadget) {
      return null;
    }

    const c1 = ColorManipulator.darken(this.context.theme.palette.base, 0.1);
    const c2 = ColorManipulator.darken(this.context.theme.palette.base, 0.4);

    return (
      <RetroPanel
        position="absolute"
        kind="metal-plate"
        title={this.context.theme.look.themeTitle}
        subtitle={this.context.theme.look.themeSubtitle}
        homeGadget={this.context.theme.look.homeGadget}
        top="0px"
        bottom="0px"
        left="0px"
        right="0px"
        margin="80px"
        radius="40px"
        strokeColor={this.context.theme.palette.dark}
        fillColor={`radial-gradient(at 20% 20%, ${c1}, ${c2})`}
      />
    );
  }

  render() {
    const {id} = this.props;

    if (!id) {
      return null;
    }

    const contentClass = this.showFooter
      ? this.styles.classNames.content
      : this.styles.classNames.contentWithoutfooter;

    return (
      <NavigatingLayer desktopId={id}>
        <Container kind="root">
          <DesktopTaskbar
            id={id}
            desktopId={id}
            onToggleFooter={this.toggleFooter}
          />
          <Container kind="right">
            <Container kind="content">
              {this.renderTopBar()}
              <Tabs id={id} desktopId={id} />
              <div className={contentClass}>
                {this.renderRetroPanel()}
                {this.renderContent()}
                {this.renderNofications()}
              </div>
              {this.renderFooter()}
            </Container>
          </Container>
        </Container>
      </NavigatingLayer>
    );
  }
}

/******************************************************************************/
export default Widget.Wired(Desktop)();
