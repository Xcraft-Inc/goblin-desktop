import {Unit} from 'electrum-theme';

/******************************************************************************/

export default function styles (theme, props) {
  const m = theme.shapes.containerMargin;
  const halfMargin = Unit.multiply (m, 0.5);
  const doubleMargin = Unit.multiply (m, 2);

  const alignRightToolbars = true;

  const level = (props.embeddedLevel || 0) + 1; // 1..n
  const yShadow = Unit.multiply ('20px', level * 0.5);
  const blur = Unit.multiply ('5px', level);
  const alpha = Math.min (0.3 + level / 10, 0.8);
  const boxShadow = `0px 0px ${yShadow} ${blur} rgba(0,0,0, ${alpha})`;

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
    padding: '0px ' + Unit.add (m, '1px') + ' 2px ' + m,
    transition: theme.transitions.easeOut (500),
  };

  const compactedDashedRowStyle = {
    display: 'flex',
    flexDirection: 'row',
    flexGrow: '1',
    padding: '5px ' + Unit.add (m, '1px') + ' 5px ' + m,
    borderTop: '1px dashed #ccc',
    transition: theme.transitions.easeOut (500),
  };

  const extendedRowStyle = {
    display: 'flex',
    flexDirection: 'row',
    flexGrow: '1',
    margin: alignRightToolbars ? '10px 0px 12px 0px' : '10px 2px 12px 2px',
    padding: '20px',
    boxShadow: boxShadow,
    borderRadius: '5px',
    transition: theme.transitions.easeOut (500),
  };

  const extendedEmbeddedRowStyle = {
    display: 'flex',
    flexDirection: 'row',
    flexGrow: '1',
    margin: alignRightToolbars ? '10px -42px 12px 0px' : '10px 2px 12px 2px',
    padding: '20px',
    boxShadow: boxShadow,
    borderRadius: '5px',
    transition: theme.transitions.easeOut (500),
  };

  const extendedReadonlyRowStyle = {
    display: 'flex',
    flexDirection: 'row',
    flexGrow: '1',
    margin: '10px 20px 12px 20px',
    padding: '0px 0px 10px 20px',
    border: '1px solid #bbb',
    borderRadius: '3px',
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

  const compactedReadonlyButtonsStyle = {
    display: 'flex',
    flexDirection: 'row',
  };

  const extendedButtonsStyle = {
    display: 'flex',
    flexDirection: 'column',
    width: '32px',
    padding: Unit.multiply (halfMargin, 0.5),
    backgroundColor: theme.palette.actionButtonBackground,
    margin: '-20px -20px -20px 0px',
    borderRadius: '0px 5px 5px 0px',
  };

  const extendedReadonlyButtonsStyle = {
    display: 'flex',
    flexDirection: 'column',
    width: '32px',
    padding: Unit.multiply (halfMargin, 0.5),
    margin: '0px 0px -10px 0px',
    borderLeft: '1px solid #ccc',
  };

  return {
    box: boxStyle,
    emptyBox: emptyBoxStyle,
    embeddedBox: embeddedBoxStyle,
    emptyembeddedBox: emptyembeddedBoxStyle,
    header: headerStyle,
    headerEmpty: headerEmptyStyle,
    compactedRow: compactedRowStyle,
    compactedDashedRow: compactedDashedRowStyle,
    extendedRow: extendedRowStyle,
    extendedEmbeddedRow: extendedEmbeddedRowStyle,
    extendedReadonlyRow: extendedReadonlyRowStyle,
    compactedItem: compactedItemStyle,
    extendedItem: extendedItemStyle,
    compactedButtons: compactedButtonsStyle,
    compactedReadonlyButtons: compactedReadonlyButtonsStyle,
    extendedButtons: extendedButtonsStyle,
    extendedReadonlyButtons: extendedReadonlyButtonsStyle,
  };
}

/******************************************************************************/
