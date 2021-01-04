import T from 't';
import React from 'react';
import Button from 'goblin-gadgets/widgets/button/widget';
import Widget from 'goblin-laboratory/widgets/widget';

class Tab extends Widget {
  constructor() {
    super(...arguments);
    this.nav = this.nav.bind(this);
    this.close = this.close.bind(this);
  }

  nav() {
    const workitemId = this.props.workitem.get('id');
    this.cmd('desktop.navToWorkitem', {
      id: this.props.desktopId,
      workitemId,
    });
  }

  close() {
    const workitemId = this.props.workitem.get('id');
    this.cmd('desktop.removeWorkitem', {
      id: this.props.desktopId,
      workitemId,
    });
  }

  render() {
    const {skipped, isActive, workitem, tabText} = this.props;

    if (skipped) {
      return null;
    }

    return (
      <div className={this.styles.classNames.tabsButton}>
        <Button
          kind="view-tab-first"
          text={tabText}
          glyph={workitem.get('glyph')}
          active={isActive}
          onClick={this.nav}
        />
        <Button
          kind="view-tab-last"
          glyph="solid/times"
          show={workitem.get('closable', false)}
          active={isActive}
          onClick={this.close}
        />
      </div>
    );
  }
}

export default Widget.connect((state, props) => {
  const workitem = state.get(
    `backend.${props.desktopId}.workitems.${props.id}`
  );
  if (!workitem) {
    return {skipped: true};
  }
  const isTab = workitem.get('kind') === 'tab';
  if (!isTab) {
    return {skipped: true};
  }

  const currentTab = state.get(
    `backend.${props.desktopId}.current.workitems.${props.context}`
  );

  const isActive = workitem.get('id') === currentTab;
  let tabText = workitem.get('description') || workitem.get('name');
  const entityId = workitem.get('entityId');
  if (entityId) {
    const entity = state.get(`backend.${entityId}`);
    if (entity) {
      tabText = entity.get('meta.summaries.info');
    } else {
      tabText = T('Chargement…');
    }
  }
  return {workitem, tabText, isActive};
})(Tab);
