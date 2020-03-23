import React from 'react';
import Widget from 'goblin-laboratory/widgets/widget';
import T from 't';
import importer from 'goblin_importer';
import Container from 'goblin-gadgets/widgets/container/widget';
import Button from 'goblin-gadgets/widgets/button/widget';
import Separator from 'goblin-gadgets/widgets/separator/widget';
const viewImporter = importer('view');

/******************************************************************************/

export default class DesktopTaskbar extends Widget {
  constructor() {
    super(...arguments);

    this.onChangeMandate = this.onChangeMandate.bind(this);
  }

  onChangeMandate() {
    this.doAs('taskbar', 'change-mandate');
  }

  render() {
    const routes = this.props.routes;
    const taskView = viewImporter(routes['/task-bar/'].component);
    const Tasks = Widget.WithRoute(taskView, 'context')(
      routes['/task-bar/'].path
    );

    return (
      <Container kind="left-bar">
        <Container kind="task-bar">
          <Button
            textTransform="none"
            text={this.props.id.split('@')[1]}
            glyph="light/cube"
            tooltip={T('Changer de mandat')}
            kind="task-logo"
            onClick={this.onChangeMandate}
          />
          <Tasks desktopId={this.props.id} />
          <Separator kind="sajex" />
          <Button
            kind="task-show-footer"
            glyph="solid/chevron-right"
            tooltip={T('Montre ou cache la barre de pied de page')}
            onClick={this.props.onToggleFooter}
          />
        </Container>
      </Container>
    );
  }
}

/******************************************************************************/
