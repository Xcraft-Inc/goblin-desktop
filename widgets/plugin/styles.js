//T:2019-02-27

import {Unit} from 'goblin-theme';
import {ColorManipulator} from 'goblin-theme';

/******************************************************************************/

export const propNames = ['embeddedLevel'];

export default function styles(theme, props) {
  const {embeddedLevel} = props;

  const m = theme.shapes.containerMargin;
  const mm = Unit.multiply(m, -1);
  const halfMargin = Unit.multiply(m, 0.5);
  const quartMargin = Unit.multiply(m, 0.25);

  const rm = Unit.add(halfMargin, '32px');
  const mrm = Unit.multiply(rm, -1);

  //--------//
  //  Box  //
  //------//

  const boxStyle = {
    flexGrow: '1',
  };

  const emptyBoxStyle = {
    flexGrow: '1',
    margin: '0px 0px -10px 0px',
  };

  const embeddedBoxStyle = {
    flexGrow: '1',
    margin: m + ' ' + mrm + ' 0px 0px',
    padding: '10px ' + rm + ' 0px 0px',
    boxShadow: '0px -6px 12px 0px rgba(0,0,0, 0.1)',
    //- backgroundColor: 'rgba(0,0,0, 0.02)',
    //- boxShadow: 'inset 0px 6px 12px 0px rgba(0,0,0, 0.05)',
  };

  const emptyembeddedBoxStyle = {
    flexGrow: '1',
    margin: m + ' ' + mrm + ' -10px 0px',
    padding: '10px ' + rm + ' 0px 0px',
    boxShadow: '0px -6px 12px 0px rgba(0,0,0, 0.1)',
    //- backgroundColor: 'rgba(0,0,0, 0.02)',
    //- boxShadow: 'inset 0px 6px 12px 0px rgba(0,0,0, 0.05)',
  };

  //-----------//
  //  Header  //
  //---------//

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

  //--------//
  //  Row  //
  //------//

  // Simulate a z-coordinate. For big level, the panel comes more forward.
  const level = embeddedLevel || 1; // 1..n
  const yShadow = Unit.add('10px', Unit.multiply('10px', level)); // 20, 30, 40, 50, ...
  const blur = Unit.multiply('5px', level); // 5, 10, 15, 20, ...
  const alpha = Math.min(0.25 + level / 20, 0.8); // 0.30, 0.35, 0.40, 0.45, ...
  const boxShadow = `0px 0px ${yShadow} ${blur} rgba(0,0,0, ${alpha})`;

  const compactedRowStyle = {
    display: 'flex',
    flexDirection: 'row',
    flexGrow: '1',
    padding: '0px ' + Unit.add(m, '1px') + ' 2px ' + m,
    transition: theme.transitions.easeOut(500),
  };

  const compactedEmbeddedRowStyle = {
    display: 'flex',
    flexDirection: 'row',
    flexGrow: '1',
    margin: '0px ' + mrm + ' 2px 0px',
    padding: '0px ' + m,
    transition: theme.transitions.easeOut(500),
  };

  const compactedDashedRowStyle = {
    display: 'flex',
    flexDirection: 'row',
    flexGrow: '1',
    margin: '0px 0px 0px 0px',
    padding: '5px ' + Unit.add(m, '1px') + ' 5px ' + m,
    borderTop: '1px solid rgba(0,0,0,0.1)',
    transition: theme.transitions.easeOut(500),
  };

  const compactedEmbeddedDashedRowStyle = {
    display: 'flex',
    flexDirection: 'row',
    flexGrow: '1',
    margin: '0px ' + mrm + ' 0px 0px',
    padding: '5px ' + m,
    borderTop: '1px solid rgba(0,0,0,0.1)',
    transition: theme.transitions.easeOut(500),
  };

  const extendedRowStyle = {
    display: 'flex',
    flexDirection: 'row',
    flexGrow: '1',
    margin: '10px 0px 12px 0px',
    padding: m,
    boxShadow: boxShadow,
    borderRadius: '5px',
    transition: theme.transitions.easeOut(500),
  };

  const extendedEmbeddedRowStyle = {
    display: 'flex',
    flexDirection: 'row',
    flexGrow: '1',
    margin: '10px ' + mrm + ' 12px 0px',
    padding: m,
    boxShadow: boxShadow,
    borderRadius: '5px',
    transition: theme.transitions.easeOut(500),
  };

  //---------//
  //  Item  //
  //-------//

  const compactedItemStyle = {
    display: 'flex',
    flexDirection: 'column',
    flexGrow: '1',
  };

  const compactedEmbeddedItemStyle = {
    display: 'flex',
    flexDirection: 'column',
    flexGrow: '1',
    padding: '0px ' + m + ' 0px 0px',
  };

  const extendedItemStyle = {
    display: 'flex',
    flexDirection: 'column',
    flexGrow: '1',
    padding: '0px ' + m + ' 0px 0px',
  };

  const extendedEmbeddedItemStyle = {
    display: 'flex',
    flexDirection: 'column',
    flexGrow: '1',
    padding: '0px ' + m + ' 0px 0px',
  };

  //-----------//
  //  Button  //
  //---------//

  // Simulate a z-coordinate. For big level, the color is lighter.
  const editBackground = ColorManipulator.lighten(
    theme.palette.pluginToolbarEditBackground,
    Math.min((level - 1) / 5, 0.8) // 0, 0.2, 0.4, ...
  );
  const readonlyBackground = ColorManipulator.lighten(
    theme.palette.pluginToolbarReadonlyBackground,
    Math.min((level - 1) / 5, 0.8) // 0, 0.2, 0.4, ...
  );

  const compactedButtonsStyle = {
    display: 'flex',
    flexDirection: 'column',
    width: '32px',
    margin: '0px ' + mm + ' 0px 0px',
    padding: '0px ' + quartMargin,
  };

  const compactedEmbeddedButtonsStyle = {
    display: 'flex',
    flexDirection: 'column',
    width: '32px',
    margin: '0px ' + mm + ' 0px 0px',
    padding: '0px ' + quartMargin,
  };

  const compactedReadonlyButtonsStyle = {
    display: 'flex',
    flexDirection: 'row',
    margin: '0px ' + mm + ' 0px 0px',
    padding: '0px ' + quartMargin,
  };

  const compactedEmbeddedReadonlyButtonsStyle = {
    display: 'flex',
    flexDirection: 'column',
    width: '32px',
    margin: '0px ' + mm + ' 0px 0px',
    padding: '0px ' + quartMargin,
  };

  const extendedButtonsStyle = {
    display: 'flex',
    flexDirection: 'column',
    width: '32px',
    margin: mm + ' ' + mm + ' ' + mm + ' 0px',
    padding: quartMargin,
    backgroundColor: editBackground,
    borderRadius: '0px 5px 5px 0px',
  };

  const extendedEmbeddedButtonsStyle = {
    display: 'flex',
    flexDirection: 'column',
    width: '32px',
    margin: mm + ' ' + mm + ' ' + mm + ' 0px',
    padding: quartMargin,
    backgroundColor: editBackground,
    borderRadius: '0px 5px 5px 0px',
  };

  const extendedReadonlyButtonsStyle = {
    display: 'flex',
    flexDirection: 'column',
    width: '32px',
    margin: mm + ' ' + mm + ' ' + mm + ' 0px',
    padding: quartMargin,
    backgroundColor: readonlyBackground,
    borderRadius: '0px 5px 5px 0px',
  };

  const extendedEmbeddedReadonlyButtonsStyle = {
    display: 'flex',
    flexDirection: 'column',
    width: '32px',
    margin: mm + ' ' + mm + ' ' + mm + ' 0px',
    padding: quartMargin,
    backgroundColor: readonlyBackground,
    borderRadius: '0px 5px 5px 0px',
  };

  //-----------------------

  return {
    box: boxStyle,
    emptyBox: emptyBoxStyle,
    embeddedBox: embeddedBoxStyle,
    emptyembeddedBox: emptyembeddedBoxStyle,

    header: headerStyle,
    headerEmpty: headerEmptyStyle,

    compactedRow: compactedRowStyle,
    compactedEmbeddedRow: compactedEmbeddedRowStyle,
    compactedDashedRow: compactedDashedRowStyle,
    compactedEmbeddedDashedRow: compactedEmbeddedDashedRowStyle,
    extendedRow: extendedRowStyle,
    extendedEmbeddedRow: extendedEmbeddedRowStyle,

    compactedItem: compactedItemStyle,
    compactedEmbeddedItem: compactedEmbeddedItemStyle,
    extendedItem: extendedItemStyle,
    extendedEmbeddedItem: extendedEmbeddedItemStyle,

    compactedButtons: compactedButtonsStyle,
    compactedEmbeddedButtons: compactedEmbeddedButtonsStyle,
    compactedReadonlyButtons: compactedReadonlyButtonsStyle,
    compactedEmbeddedReadonlyButtons: compactedEmbeddedReadonlyButtonsStyle,
    extendedButtons: extendedButtonsStyle,
    extendedEmbeddedButtons: extendedEmbeddedButtonsStyle,
    extendedReadonlyButtons: extendedReadonlyButtonsStyle,
    extendedEmbeddedReadonlyButtons: extendedEmbeddedReadonlyButtonsStyle,
  };
}

/******************************************************************************/
