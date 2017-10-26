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

  return {
    box: boxStyle,
    header: headerStyle,
    headerEmpty: headerEmptyStyle,
  };
}

/******************************************************************************/
