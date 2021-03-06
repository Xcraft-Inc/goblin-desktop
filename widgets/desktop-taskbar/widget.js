import React from 'react';
import Widget from 'goblin-laboratory/widgets/widget';
import T from 't';
import Container from 'goblin-gadgets/widgets/container/widget';
import Button from 'goblin-gadgets/widgets/button/widget';
import Separator from 'goblin-gadgets/widgets/separator/widget';
import Taskbar from 'goblin-desktop/widgets/taskbar/widget.js';
/******************************************************************************/

class DesktopTaskbar extends Widget {
  constructor() {
    super(...arguments);

    this.onChangeMandate = this.onChangeMandate.bind(this);
  }

  onChangeMandate() {
    this.doAs('taskbar', 'change-mandate');
  }

  render() {
    return (
      <Container kind="left-bar">
        <Button
          textTransform="none"
          text={this.props.id.split('@')[1]}
          glyph={this.props.loading ? 'solid/spinner' : 'light/cube'}
          kind="task-logo"
          busy={this.props.working}
        />
        <Container kind="task-bar">
          <Taskbar id={`taskbar@${this.props.id}`} desktopId={this.props.id} />
          <Separator kind="sajex" />
        </Container>
        <Button
          kind="task-show-footer"
          glyph="solid/chevron-right"
          tooltip={T('Montre ou cache la barre de pied de page')}
          onClick={this.props.onToggleFooter}
        />
      </Container>
    );
  }
}
export default Widget.connect((state, props) => {
  const working = state.get(`backend.${props.id}.working`);
  const content = state.get(`backend.${props.id}.note`);
  const userSession = Widget.getUserSession(state);
  const prototypeMode = userSession.get('prototypeMode');
  if (prototypeMode && content === 'sfx=on') {
    window.mainGain.connect(window.mainAudioCtx.destination);
  } else {
    window.mainGain.disconnect();
  }
  return {working};
})(DesktopTaskbar);
/******************************************************************************/
