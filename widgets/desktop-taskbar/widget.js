import React from 'react';
import Widget from 'goblin-laboratory/widgets/widget';
import T from 't';
import Container from 'goblin-gadgets/widgets/container/widget';
import Button from 'goblin-gadgets/widgets/button/widget';
import Separator from 'goblin-gadgets/widgets/separator/widget';

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
          {/*TODO: INJECT TASKS*/}
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
  return {working};
})(DesktopTaskbar);
/******************************************************************************/
