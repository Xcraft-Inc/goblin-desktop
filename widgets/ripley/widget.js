//T:2019-02-27
import React from 'react';
import T from 't';
import Widget from 'goblin-laboratory/widgets/widget';
import {fromJS} from 'immutable';
import Shredder from 'xcraft-core-shredder';
import {date as DateConverters} from 'xcraft-core-converters';
import C from 'goblin-laboratory/widgets/connect-helpers/c';
import withC from 'goblin-laboratory/widgets/connect-helpers/with-c';
import Label from 'goblin-gadgets/widgets/label/widget';
import Calendar from 'goblin-gadgets/widgets/calendar/widget';
import Tree from 'goblin-gadgets/widgets/tree/widget';
import WithModel from 'goblin-laboratory/widgets/with-model/widget';
import * as styles from './styles';

/******************************************************************************/

function transformTimestamp(timestamp) {
  timestamp = timestamp.split('T');
  let newString = timestamp[0];
  if (timestamp.length === 2) {
    // day
    newString = `${timestamp[0].substring(6, 8)}`;
    // month
    newString += `.${timestamp[0].substring(4, 6)}`;
    // year
    newString += `.${timestamp[0].substring(0, 4)}`;
    // hour
    newString += ` ${timestamp[1].substring(0, 2)}`;
    // minutes
    newString += `:${timestamp[1].substring(2, 4)}`;
    // millisecondes
    newString += `:${timestamp[1].substring(4, 6)}`;
  }
  return newString;
}

/******************************************************************************/

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
          let text = transformTimestamp(branch.split('_')[1]);
          subrows.push({id: branch, database: text});
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
        selectionMode="single"
        selection="true"
        selectedIds={[this.props.selected]}
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

/******************************************************************************/

let Ripley = class Ripley extends Widget {
  constructor() {
    super(...arguments);
    this.styles = styles;
    this.select = this.select.bind(this);
  }

  select(type, selectedId) {
    this.doFor(this.props.id, 'select', {type, selectedId});
  }

  render() {
    if (!this.props.id) {
      return null;
    }

    return (
      <WithModel model={`backend.${this.props.id}`}>
        <div className={this.styles.classNames.ripley}>
          <div className={this.styles.classNames.ripleyTree}>
            <RipleyTree
              type="from"
              description={T('From')}
              hasBranches={true}
              onSelect={this.select}
              db={C(`.db`)}
              selected={C(`.selected.from`)}
            />
          </div>
          <div className={this.styles.classNames.ripleyArrow}>
            <Label
              glyph="solid/arrow-right"
              glyphSize="400%"
              glyphPosition="center"
              justify="center"
            />
          </div>
          <div className={this.styles.classNames.ripleyTree}>
            <RipleyTree
              type="to"
              description={T('To')}
              hasBranches={false}
              onSelect={this.select}
              db={C(`.db`)}
              selected={C(`.selected.to`)}
            />
          </div>
        </div>
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

/******************************************************************************/

Ripley = withC(Ripley);
export default Ripley;
