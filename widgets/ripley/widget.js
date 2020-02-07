//T:2019-02-27
import React from 'react';
import T from 't';
import Widget from 'goblin-laboratory/widgets/widget';
import {fromJS} from 'immutable';
import Shredder from 'xcraft-core-shredder';
import {date as DateConverters} from 'xcraft-core-converters';
import C from 'goblin-laboratory/widgets/connect-helpers/c';
import withC from 'goblin-laboratory/widgets/connect-helpers/with-c';
import Container from 'goblin-gadgets/widgets/container/widget';
import Calendar from 'goblin-gadgets/widgets/calendar/widget';
import Tree from 'goblin-gadgets/widgets/tree/widget';
import WithModel from 'goblin-laboratory/widgets/with-model/widget';

let RipleyTree = class RipleyTree extends Widget {
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
};

RipleyTree = withC(RipleyTree);

let Ripley = class Ripley extends Widget {
  constructor() {
    super(...arguments);
    this.select = this.select.bind(this);
  }

  select(type, selectedId) {
    this.do('select', {type, selectedId});
  }

  render() {
    if (!this.props.id) {
      return null;
    }

    return (
      <WithModel model={`backend.${this.props.id}`}>
        <Container kind="row" grow="1">
          <Container kind="column" grow="1">
            <RipleyTree
              type="from"
              description={T('Actions store (from)')}
              hasBranches={true}
              onSelect={this.select}
              db={C(`.db`)}
              selected={C(`.selected.from`)}
            />
          </Container>
          <Container kind="column" grow="1">
            <RipleyTree
              type="to"
              description={T('Actions store (to)')}
              hasBranches={false}
              onSelect={this.select}
              db={C(`.db`)}
              selected={C(`.selected.to`)}
            />
          </Container>
        </Container>
      </WithModel>
    );
  }

  renderCalendar() {
    return (
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
    );
  }
};

Ripley = withC(Ripley);
export default Ripley;
