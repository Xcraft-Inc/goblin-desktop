import {ColorManipulator} from 'goblin-theme';
import TableHelpers from 'goblin-gadgets/widgets/helpers/table-helpers.js';

/******************************************************************************/

export const propNames = ['height', 'minHeight', 'selected', 'rowIndex'];

export default function styles(theme, props) {
  const {height, minHeight, selected, rowIndex} = props;

  let backgroundColor = theme.palette.tableCellBackground;
  if (theme.look.name === 'retro' && rowIndex % 2 === 0) {
    backgroundColor = ColorManipulator.darken(backgroundColor, 0.1);
  }

  const entityRow = {
    'position': 'relative',
    'height': height,
    'minHeight': minHeight,
    'display': 'flex',
    'flexDirection': 'row',
    'alignItems': 'center',
    'padding': '5px 20px',
    'overflow': 'hidden',
    'color': selected ? theme.palette.tableSelectedText : null,
    'backgroundColor': selected
      ? TableHelpers.getSelectedBackgroundColor(theme, 'none')
      : TableHelpers.getBackgroundColor(theme, backgroundColor, 'none'),
    'borderBottom': `1px solid ${theme.palette.viewBackground}`,
    'cursor': 'default',
    ':hover': {
      backgroundColor: selected
        ? TableHelpers.getSelectedBackgroundColor(theme, 'main')
        : TableHelpers.getBackgroundColor(theme, backgroundColor, 'main'),
    },
    ':hover .buttons-hover': {
      transition: '0.4s ease-out', // delay for showing
      right: '0px',
    },
  };

  const buttons = {
    position: 'absolute',
    height: '100%',
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    // Animated:
    transition: '1.0s ease-out', // delay for hidden
    right: '-75px',
  };

  const busyBox = {
    zIndex: 9,
    position: 'absolute',
    left: '50px',
    top: '50%',
    width: '0px',
    height: '0px',
    display: 'flex',
  };

  const filteredCellBarre = {
    display: 'flex',
    flexDirection: 'row',
    margin: '-5px 0px',
  };

  const filteredCellGauge = {
    display: 'flex',
    flexDirection: 'row',
  };

  /******************************************************************************/

  return {
    entityRow,
    buttons,
    busyBox,
    filteredCellBarre,
    filteredCellGauge,
  };
}

/******************************************************************************/
