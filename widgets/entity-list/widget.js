//T:2019-02-27

import React from 'react';
import Widget from 'goblin-laboratory/widgets/widget';
import throttle from 'lodash/throttle';
import List from 'goblin-gadgets/widgets/list/widget';
import TableCell from 'goblin-gadgets/widgets/table-cell/widget';
import Container from 'goblin-gadgets/widgets/container/widget';
import Button from 'goblin-gadgets/widgets/button/widget';
import EntityListItem from 'goblin-desktop/widgets/entity-list-item/widget';
import Shredder from 'xcraft-core-shredder';
import Label from 'goblin-gadgets/widgets/label/widget';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import T from 't';
import ListHelpers from 'goblin-workshop/lib/list-helpers.js';

/******************************************************************************/

class ListToolbar extends Widget {
  constructor() {
    super(...arguments);
    this.exportToCsv = this.exportToCsv.bind(this);
    this.exportToJSON = this.exportToJSON.bind(this);
    this.selectQuery = this.selectQuery.bind(this);
  }

  exportToCsv() {
    this.doAs(`${this.props.type}-list`, 'export-to-csv', {});
  }

  exportToJSON() {
    this.doAs(`${this.props.type}-list`, 'export-to-json', {});
  }

  selectQuery(event) {
    this.doAs(`${this.props.type}-list`, 'select-query', {
      value: event.target.value,
    });
  }

  render() {
    const {id, exporting, query, queriesPreset} = this.props;
    if (!id) {
      return null;
    }
    return (
      <div>
        {exporting ? (
          <div>
            <Label text={T('Export en cours...')} />
          </div>
        ) : (
          <Container kind="row">
            <Button
              kind="action"
              place="1/2"
              width="250px"
              glyph="solid/save"
              text={T('Exporter un fichier csv')}
              onClick={this.exportToCsv}
            />

            <Button
              kind="action"
              place="2/2"
              width="250px"
              glyph="solid/save"
              text={T('Exporter un fichier JSON')}
              onClick={this.exportToJSON}
            />

            {queriesPreset &&
              queriesPreset.map((p, index) => {
                return (
                  <div key={index}>
                    <label>
                      <input
                        type="radio"
                        name={p}
                        value={p}
                        checked={p === query}
                        onChange={this.selectQuery}
                      />
                      {p}
                    </label>
                  </div>
                );
              })}
          </Container>
        )}
      </div>
    );
  }
}

const Toolbar = Widget.connect((state, props) => {
  return {
    exporting: state.get(`backend.${props.id}.exporting`, false),
    type: state.get(`backend.${props.id}.type`),
    queriesPreset: state.get(`backend.${props.id}.queriesPreset`),
    query: state.get(`backend.${props.id}.query`),
  };
})(ListToolbar);

/******************************************************************************/

class EntityList extends Widget {
  constructor() {
    super(...arguments);

    this._entityIds = [];
    this._drillDownInternal = this._drillDownInternal.bind(this);
    this._drillDown = throttle(this._drillDownInternal, 100).bind(this);
    this.drillDown = this.drillDown.bind(this);
  }

  _drillDownInternal() {
    this.doAs(`${this.props.type}-list`, 'drill-down', {
      entityIds: this._entityIds,
    });
    this._entityIds = [];
  }

  drillDown(entityId) {
    this._entityIds.push(entityId);
    this._drillDown();
  }

  static get wiring() {
    return {
      id: 'id',
      type: 'type',
      loading: 'loading',
    };
  }

  renderList() {
    const {id, columns} = this.props;
    if (!columns) {
      return null;
    }
    const listId = `list@${id}`;
    const width = ListHelpers.getEstimatedWidth(columns);
    const widthStyle = {
      minWidth: width,
    };
    return (
      <div className={this.styles.classNames.list}>
        <div className={this.styles.classNames.content} style={widthStyle}>
          <div className={this.styles.classNames.header}>
            <TableCell isLast={false} isHeader={true} width="50px" text="n°" />
            {columns.map((c) => {
              return (
                <TableCell
                  key={c}
                  isLast={false}
                  isHeader={true}
                  {...ListHelpers.getColumnProps(c)}
                  text={ListHelpers.getColumnHeaderText(c)}
                />
              );
            })}
          </div>

          <div className={this.styles.classNames.rows}>
            <List
              id={listId}
              type={'uniform'}
              renderItem={EntityListItem}
              data={{
                onDrillDown: this.drillDown,
                onRenewTTL: this.renewTTL,
                columns: new Shredder(columns),
              }}
            />
          </div>
        </div>
      </div>
    );
  }

  render() {
    const {id} = this.props;
    if (!id) {
      return null;
    }

    return (
      <div className={this.styles.classNames.full}>
        <div className={this.styles.classNames.toolbar}>
          <Toolbar id={id} />
        </div>
        {!this.props.loading ? (
          <div /> //this.renderList()
        ) : (
          <FontAwesomeIcon icon={[`fas`, 'spinner']} size={'8x'} pulse />
        )}
      </div>
    );
  }
}

const ConnectedEntityList = Widget.connect((state, props) => {
  return {columns: state.get(`backend.list@${props.id}.columns`)};
})(EntityList);

/******************************************************************************/

export default Widget.Wired(ConnectedEntityList);
