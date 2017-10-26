import {Unit} from 'electrum-theme';

/******************************************************************************/

export default function styles (theme, props) {
  const m = theme.shapes.containerMargin;
  const halfMargin = Unit.multiply (m, 0.5);

  const boxStyle = {
    flexGrow: '1',
  };

  const headerStyle = {
    display: 'flex',
    flexDirection: 'row',
    flexGrow: '1',
    padding: halfMargin + ' ' + m,
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
    padding: '0px ' + m + ' ' + halfMargin + ' ' + m,
  };

  const extendedRowStyle = {
    display: 'flex',
    flexDirection: 'row',
    flexGrow: '1',
    margin: '0px ' + halfMargin + ' ' + halfMargin + ' ' + halfMargin,
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
    marginLeft: '10px',
  };

  const extendedButtonsStyle = {
    display: 'flex',
    flexDirection: 'column',
    width: '32px',
    padding: halfMargin,
    backgroundColor: '#ddd',
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
