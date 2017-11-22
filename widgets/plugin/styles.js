import {Unit} from 'electrum-theme';

/******************************************************************************/

export default function styles (theme, props) {
  const m = theme.shapes.containerMargin;
  const halfMargin = Unit.multiply (m, 0.5);
  const doubleMargin = Unit.multiply (m, 2);

  const alignRightToolbars = true;

  // Simulate a z-coordinate. For big level, the panel comes more forward.
  const level = props.embeddedLevel || 1; // 1..n
  const yShadow = Unit.add ('10px', Unit.multiply ('10px', level)); // 20, 30, 40, 50, ...
  const blur = Unit.multiply ('5px', level); // 5, 10, 15, 20, ...
  const alpha = Math.min (0.25 + level / 20, 0.8); // 0.30, 0.35, 0.40, 0.45, ...
  const boxShadow = `0px 0px ${yShadow} ${blur} rgba(0,0,0, ${alpha})`;

  const boxStyle = {
    flexGrow: '1',
    margin: '0px -20px 0px -20px',
    padding: '0px 0px 0px 0px',
  };

  const emptyBoxStyle = {
    flexGrow: '1',
    margin: '0px -20px 0px -20px',
    padding: '0px 0px 0px 0px',
  };

  const embeddedBoxStyle = {
    flexGrow: '1',
    margin: '10px -20px 0px -20px',
    padding: '10px 0px 0px 0px',
    borderTop: '1px solid #bbb',
  };

  const emptyembeddedBoxStyle = {
    flexGrow: '1',
    margin: '0px -20px 0px -20px',
    padding: '0px 0px 0px 0px',
    borderTop: '1px solid #bbb',
  };

  const headerStyle = {
    display: 'flex',
    flexDirection: 'row',
    flexGrow: '1',
    margin: '0px 20px 10px 20px',
    padding: '0px 0px 0px 0px',
    cursor: 'default',
    userSelect: 'none',
  };

  const headerEmptyStyle = {
    display: 'flex',
    flexDirection: 'row',
    flexGrow: '1',
    margin: '0px 20px 0px 20px',
    padding: '0px 0px 0px 0px',
    cursor: 'default',
    userSelect: 'none',
  };

  const compactedRowStyle = {
    display: 'flex',
    flexDirection: 'row',
    flexGrow: '1',
    margin: '0px 0px 0px 0px',
    padding: '5px 0px 5px 20px',
    transition: theme.transitions.easeOut (500),
  };

  const compactedDashedRowStyle = {
    display: 'flex',
    flexDirection: 'row',
    flexGrow: '1',
    margin: '0px 0px 0px 0px',
    padding: '5px 0px 5px 20px',
    borderTop: '1px dashed #ccc',
    transition: theme.transitions.easeOut (500),
  };

  const extendedRowStyle = {
    display: 'flex',
    flexDirection: 'row',
    flexGrow: '1',
    margin: '10px 0px 10px 0px',
    padding: '0px 0px 0px 0px',
    boxShadow: boxShadow,
    borderRadius: '5px',
    transition: theme.transitions.easeOut (500),
  };

  const extendedEmbeddedRowStyle = {
    display: 'flex',
    flexDirection: 'row',
    flexGrow: '1',
    margin: '10px -42px 10px 0px',
    padding: '0px 0px 0px 0px',
    boxShadow: boxShadow,
    borderRadius: '5px',
    transition: theme.transitions.easeOut (500),
  };

  const extendedReadonlyRowStyle = {
    display: 'flex',
    flexDirection: 'row',
    flexGrow: '1',
    margin: '0px 0px 0px 0px',
    padding: '0px 0px 0px 0px',
    border: alignRightToolbars ? null : '1px solid #bbb',
    borderRadius: '3px',
    boxShadow: boxShadow,
    backgroundColor: theme.palette.paneBackground,
    transition: theme.transitions.easeOut (500),
  };

  const extendedEmbeddedReadonlyRowStyle = {
    display: 'flex',
    flexDirection: 'row',
    flexGrow: '1',
    margin: '0px 0px 0px 0px',
    padding: '0px 0px 0px 0px',
    border: alignRightToolbars ? null : '1px solid #bbb',
    borderRadius: '3px',
    boxShadow: boxShadow,
    backgroundColor: theme.palette.paneBackground,
    transition: theme.transitions.easeOut (500),
  };

  const compactedItemStyle = {
    display: 'flex',
    flexDirection: 'column',
    flexGrow: '1',
    margin: '0px 0px 0px 0px',
    padding: '0px 0px 0px 0px',
  };

  const compactedEmbeddedItemStyle = {
    display: 'flex',
    flexDirection: 'column',
    flexGrow: '1',
    margin: '0px 20px 0px 0px',
    padding: '0px 0px 0px 0px',
  };

  const extendedItemStyle = {
    display: 'flex',
    flexDirection: 'column',
    flexGrow: '1',
    margin: '0px 0px 0px 0px',
    padding: '20px',
  };

  const extendedEmbeddedItemStyle = {
    display: 'flex',
    flexDirection: 'column',
    flexGrow: '1',
    margin: '0px 0px 0px 0px',
    padding: '20px',
  };

  const compactedButtonsStyle = {
    display: 'flex',
    flexDirection: 'column',
    width: '32px',
    padding: '5px',
  };

  // ->
  const compactedEmbeddedButtonsStyle = {
    display: 'flex',
    flexDirection: 'column',
    width: '32px',
    margin: '0px -42px 0px 0px',
    padding: '5px',
  };

  const compactedReadonlyButtonsStyle = {
    display: 'flex',
    flexDirection: 'column',
    width: '32px',
    padding: '5px',
  };

  // ->
  const compactedEmbeddedReadonlyButtonsStyle = {
    display: 'flex',
    flexDirection: 'column',
    width: '32px',
    padding: '5px',
    backgroundColor: theme.palette.actionButtonBackground,
    borderRadius: '0px 5px 5px 0px',
  };

  const extendedButtonsStyle = {
    display: 'flex',
    flexDirection: 'column',
    width: '32px',
    padding: '5px',
    backgroundColor: theme.palette.actionButtonBackground,
    borderRadius: '0px 5px 5px 0px',
  };

  const extendedReadonlyButtonsStyle = {
    display: 'flex',
    flexDirection: 'column',
    width: '32px',
    padding: '5px',
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
    extendedEmbeddedReadonlyRow: extendedEmbeddedReadonlyRowStyle,
    compactedItem: compactedItemStyle,
    compactedEmbeddedItem: compactedEmbeddedItemStyle,
    extendedItem: extendedItemStyle,
    extendedEmbeddedItem: extendedEmbeddedItemStyle,
    compactedButtons: compactedButtonsStyle,
    compactedEmbeddedButtons: compactedEmbeddedButtonsStyle,
    compactedReadonlyButtons: compactedReadonlyButtonsStyle,
    compactedEmbeddedReadonlyButtons: compactedEmbeddedReadonlyButtonsStyle,
    extendedButtons: extendedButtonsStyle,
    extendedReadonlyButtons: extendedReadonlyButtonsStyle,
  };
}

/******************************************************************************/
