'use strict';

import Widget from 'laboratory/widget';
import React from 'react';
import Container from 'gadgets/container/widget';
import Button from 'gadgets/button/widget';

class Monitor extends Widget {
  constructor() {
    super(...arguments);
    this.toggleEnabled = this.toggleEnabled.bind(this);
    this.collectRequested = false;
  }

  toggleEnabled() {
    this.dispatch({type: 'TOGGLE'});
  }

  connectLocalStateMonitor() {
    return this.mapWidget(
      props => {
        const size = props.state.size;
        if (size > 1000 && this.collectRequested === false) {
          this.collectRequested = true;
          setTimeout(() => {
            this.doAs('warehouse', 'collect');
            setTimeout(() => {
              this.collectRequested = false;
              console.log('collect ready');
            }, 10000);
          }, 1000);
        }
        return <div style={{fontWeight: 900}}>LocalState: {size}</div>;
      },
      'state',
      'backend'
    );
  }

  connectWarehouseInfosMonitor() {
    return this.mapWidget(
      props => {
        if (!props.infos) {
          return <div style={{fontWeight: 900}}>WarehouseInfos: N/A</div>;
        }
        const size = props.infos.size;
        return (
          <div style={{fontWeight: 900}}>
            WarehouseState: {size} Feeds:
            {props.infos.feeds}
          </div>
        );
      },
      'infos',
      'infos.warehouse'
    );
  }

  renderMonitors() {
    const LocalStateMonitor = this.connectLocalStateMonitor();
    const WarehouseMonitor = this.connectWarehouseInfosMonitor();

    return (
      <div style={{margin: '10px'}}>
        <LocalStateMonitor />
        <WarehouseMonitor />
      </div>
    );
  }

  render() {
    const {enabled} = this.props;
    return (
      <Container kind="row">
        <Button
          kind="button-footer"
          text="Monitor"
          onClick={this.toggleEnabled}
        />
        {enabled ? this.renderMonitors() : null}
      </Container>
    );
  }
}

export default Widget.connectWidget(state => {
  return {
    enabled: state ? state.get('enabled') : false,
  };
})(Monitor);
