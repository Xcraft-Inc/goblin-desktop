import {Unit} from 'electrum-theme';

/******************************************************************************/

export default function styles (theme, props) {
  const m = theme.shapes.containerMargin;
  const halfMargin = Unit.multiply (m, 0.5);
  const doubleMargin = Unit.multiply (m, 2);

  const boxStyle = {
    flexGrow: '1',
  };

  const emptyBoxStyle = {
    flexGrow: '1',
    margin: '0px 0px -10px 0px',
  };

  const embeddedBoxStyle = {
    flexGrow: '1',
    margin: '20px 0px 0px 0px',
    padding: '10px 0px 0px 0px',
    borderTop: '1px solid #bbb',
  };

  const emptyembeddedBoxStyle = {
    flexGrow: '1',
    margin: '20px 0px -10px 0px',
    padding: '10px 0px 0px 0px',
    borderTop: '1px solid #bbb',
  };

  const headerStyle = {
    display: 'flex',
    flexDirection: 'row',
    flexGrow: '1',
    padding: halfMargin + ' ' + m + ' ' + '5px' + ' ' + m,
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
    //? padding: '0px ' + Unit.add (m, '1px') + ' ' + '2px' + ' ' + m,
    padding: '5px ' + Unit.add (m, '1px') + ' ' + '5px' + ' ' + m,
    borderTop: '1px dashed #ccc',
    transition: theme.transitions.easeOut (500),
  };

  const extendedRowStyle = {
    display: 'flex',
    flexDirection: 'row',
    flexGrow: '1',
    //? margin: '10px ' + m + ' ' + '12px' + ' ' + m,
    margin: '10px 2px 12px 2px',
    borderTop: '1px solid #bbb',
    borderBottom: '1px solid #bbb',
    padding: '20px',
    boxShadow: '0px 0px 30px rgba(0,0,0, 0.5)',
    borderRadius: '5px',
    transition: theme.transitions.easeOut (500),
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
    padding: halfMargin + ' ' + m + ' 0px 0px',
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
    backgroundColor: theme.palette.actionButtonBackground,
    marginLeft: '10px',
    margin: '-20px -20px -20px 0px',
    borderRadius: '0px 5px 5px 0px',
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
