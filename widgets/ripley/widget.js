//T:2019-02-27
import React from 'react';
import Widget from 'laboratory/widget';
import {fromJS} from 'immutable';
import Shredder from 'xcraft-core-shredder';
import {date as DateConverters} from 'xcraft-core-converters';

import Container from 'gadgets/container/widget';
import Calendar from 'gadgets/calendar/widget';
import Tree from 'gadgets/tree/widget';

class RipleyTree extends Widget {
  static get wiring() {
    return {
      db: 'db',
      selected: 'selected',
    };
  }

  render() {
    let table = new Shredder({
      header: [
        {
          name: 'database',
          description: this.props.description,
          grow: '1',
          textAlign: 'left',
        },
      ],
      rows: [],
    });

    const rows = [];

    for (let [db, branches] of this.props.db.entries()) {
      const subrows = [];

      if (this.props.hasBranches) {
        branches = branches.get('branches');
        for (const branch of branches.values()) {
          subrows.push({id: branch, database: branch});
        }
      }

      rows.push({id: db, database: db, rows: subrows});
    }

    table = table.set('rows', fromJS(rows));

    return (
      <Tree
        data={table}
        grow="1"
        frame="false"
        hasButtons="false"
        selection="true"
        selectedIds={this.props.selected}
        selectionChanged={selectedId => {
          if (this.props.onSelect) {
            this.props.onSelect(this.props.type, selectedId);
          }
        }}
      />
    );
  }
}

class Ripley extends Widget {
  constructor() {
    super(...arguments);
    this.select = this.select.bind(this);
  }

  static get wiring() {
    return {
      id: 'id',
    };
  }

  makeTree(type) {
    const WiredRipleyTree = this.mapWidget(
      RipleyTree,
      ripley => {
        return {
          db: ripley.get('db'),
          selected: ripley.get(`selected.${type}`),
        };
      },
      `backend.${this.props.id}`
    );

    return WiredRipleyTree;
  }

  select(type, selectedId) {
    this.do('select', {type, selectedId});
  }

  render() {
    if (!this.props.id) {
      return null;
    }

    const WiredRipleyTreeFrom = this.makeTree('from');
    const WiredRipleyTreeTo = this.makeTree('to');

    return (
      <Container>
        <WiredRipleyTreeFrom
          type="from"
          description={T('Actions store (from)')}
          hasBranches={true}
          onSelect={this.select}
        />
        <Calendar
          monthCount={1}
          navigator="standard"
          startDate={DateConverters.getNowCanonical()}
          endDate={DateConverters.getNowCanonical()}
          visibleDate={DateConverters.getNowCanonical()}
          dates={[]}
          readonly={true}
          dateClicked={() => {}}
          visibleDateChanged={() => {}}
        />

        <WiredRipleyTreeTo
          type="to"
          description={T('Actions store (to)')}
          hasBranches={false}
          onSelect={this.select}
        />
      </Container>
    );
  }
}

export default Ripley;
