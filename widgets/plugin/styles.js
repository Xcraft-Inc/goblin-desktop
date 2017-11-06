import {Unit} from 'electrum-theme';

/******************************************************************************/

export default function styles (theme, props) {
  const m = theme.shapes.containerMargin;
  const halfMargin = Unit.multiply (m, 0.5);

  const boxStyle = {
    flexGrow: '1',
  };

  const emptyBoxStyle = {
    flexGrow: '1',
    margin: '0px 0px -10px 0px',
  };

  const embeddedBoxStyle = {
    flexGrow: '1',
    margin: '10px 10px 10px 10px',
    borderTop: '1px solid #bbb',
  };

  const emptyembeddedBoxStyle = {
    flexGrow: '1',
    margin: '10px 10px -10px 10px',
    borderTop: '1px solid #bbb',
  };

  const headerStyle = {
    display: 'flex',
    flexDirection: 'row',
    flexGrow: '1',
    padding: halfMargin + ' ' + m + ' ' + '2px' + ' ' + m,
    cursor: 'default',
    userSelect: 'none',
  };

  const headerEmptyStyle = {
    display: 'flex',
    flexDirection: 'row',
    flexGrow: '1',
    padding: halfMargin + ' ' + m + ' ' + m + ' ' + m,
    cursor: 'default',
    userSelect: 'none',
  };

  const compactedRowStyle = {
    display: 'flex',
    flexDirection: 'row',
    flexGrow: '1',
    padding: '0px ' + Unit.add (m, '1px') + ' ' + '2px' + ' ' + m,
  };

  const extendedRowStyle = {
    display: 'flex',
    flexDirection: 'row',
    flexGrow: '1',
    margin: '5px ' + halfMargin + ' ' + '7px' + ' ' + halfMargin,
    backgroundColor: '#eee',
    border: '1px solid #bbb',
  };

  const compactedItemStyle = {
    display: 'flex',
    flexDirection: 'column',
    flexGrow: '1',
  };

  const extendedItemStyle = {
    display: 'flex',
    flexDirection: 'column',
    flexGrow: '1',
    padding: halfMargin + ' ' + halfMargin + ' 0px ' + halfMargin,
  };

  const compactedButtonsStyle = {
    display: 'flex',
    flexDirection: 'column',
    width: '32px',
  };

  const extendedButtonsStyle = {
    display: 'flex',
    flexDirection: 'column',
    width: '32px',
    padding: Unit.multiply (halfMargin, 0.5),
    backgroundColor: '#eee',
    borderLeft: '1px solid #bbb',
  };

  const spaceStyle = {
    height: '2px',
  };

  const sajexStyle = {
    flexGrow: '1',
  };

  return {
    box: boxStyle,
    emptyBox: emptyBoxStyle,
    embeddedBox: embeddedBoxStyle,
    emptyembeddedBox: emptyembeddedBoxStyle,
    header: headerStyle,
    headerEmpty: headerEmptyStyle,
    compactedRow: compactedRowStyle,
    extendedRow: extendedRowStyle,
    compactedItem: compactedItemStyle,
    extendedItem: extendedItemStyle,
    compactedButtons: compactedButtonsStyle,
    extendedButtons: extendedButtonsStyle,
    space: spaceStyle,
    sajex: sajexStyle,
  };
}

/******************************************************************************/
