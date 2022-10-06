//T:2019-02-27

import React from 'react';
import View from 'goblin-laboratory/widgets/view';
import Container from 'goblin-gadgets/widgets/container/widget';
import Editor from 'goblin-desktop/widgets/editor/widget';
import Search from 'goblin-desktop/widgets/search/widget';
import Datagrid from 'goblin-desktop/widgets/datagrid/widget';
import Wizard from 'goblin-desktop/widgets/wizard/widget';
import WorkitemDialog from 'goblin-desktop/widgets/workitem-dialog/widget';
import Hinter from 'goblin-desktop/widgets/hinter/widget.js';
import Detail from 'goblin-desktop/widgets/detail/widget.js';
import Splitter from 'goblin-gadgets/widgets/splitter/widget.js';
import Separator from 'goblin-gadgets/widgets/separator/widget.js';

class DefaultView extends View {
  renderHinter(useHinter) {
    if (!useHinter || !this.props.hinter) {
      return null;
    }
    return (
      <Container kind="row" grow="1">
        <Hinter id={this.props.hinter} />
      </Container>
    );
  }

  renderDetail() {
    if (!this.props.detail) {
      return null;
    }
    return (
      <Detail
        id={this.props.detail}
        leftPanelWorkitemId={this.props.leftPanelWorkitemId}
      />
    );
  }

  renderViews(workitemType, LeftPanel, useHinter, additionnalProps) {
    switch (workitemType) {
      case 'workitem':
      case 'wizard':
        return (
          <Splitter
            id="goblin-desktop/editor"
            kind="vertical"
            firstSize={this.props.width || '800px'}
            firstMinSize={this.props.width || '800px'}
            firstMaxSize="1500px"
          >
            {LeftPanel ? (
              <LeftPanel id={this.props.workitemId} {...additionnalProps} />
            ) : (
              <></>
            )}
            <>
              {this.renderHinter(useHinter) ?? (
                <Separator kind="sajex"></Separator>
              )}
              {this.renderDetail()}
            </>
          </Splitter>
        );

      default:
        return (
          <>
            {LeftPanel ? (
              <LeftPanel id={this.props.workitemId} {...additionnalProps} />
            ) : null}
            {this.renderHinter(useHinter)}
            {this.renderDetail()}
          </>
        );
    }
  }

  render() {
    const {workitemId, dialogId, desktopId, context} = this.props;
    if (!workitemId && !dialogId) {
      return null;
    }

    let LeftPanel = null;
    let WiredDialog = null;
    let useHinter = true;
    let canDo = true;
    let workitemType;

    if (workitemId) {
      const workitem = workitemId.split('@')[0];
      workitemType = workitem.substring(workitem.lastIndexOf('-') + 1);
      canDo = this.canDo(`${workitem}.edit`);
      if (workitem.endsWith('-workitem')) {
        LeftPanel = Editor;
      } else if (workitem.endsWith('-search')) {
        LeftPanel = Search;
        useHinter = false;
      } else if (workitem.endsWith('-datagrid')) {
        LeftPanel = Datagrid;
      } else if (workitem.endsWith('-wizard')) {
        LeftPanel = Wizard;
      } else {
        throw new Error(`${workitem} kind not implemented in default view`);
      }
    }

    if (dialogId) {
      const dialog = dialogId.split('@')[0];
      if (dialog.endsWith('-wizard')) {
        WiredDialog = Wizard;
      } else if (dialog.endsWith('-datagrid')) {
        WiredDialog = Datagrid;
      } else if (dialog.endsWith('-workitem')) {
        WiredDialog = WorkitemDialog;
      } else {
        throw new Error(
          `${dialog} dialog kind not implemented in default view`
        );
      }
    }

    const additionnalProps = {};
    if (!canDo) {
      additionnalProps.readonly = true;
    }
    return (
      <Container kind="views">
        {WiredDialog ? <WiredDialog id={dialogId} kind="dialog" /> : null}
        {this.renderViews(workitemType, LeftPanel, useHinter, additionnalProps)}
      </Container>
    );
  }
}

export default DefaultView;
