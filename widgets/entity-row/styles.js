import {ColorManipulator} from 'electrum-theme';

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
    'color': selected ? theme.palette.tableSelectedText : null,
    'backgroundColor': selected
      ? theme.palette.tableSelectedBackground
      : backgroundColor,
    'borderBottom': `1px solid ${theme.palette.viewBackground}`,
    'cursor': 'default',
    ':hover': {
      backgroundColor: theme.palette.tableHoverBackground,
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

  /******************************************************************************/

  return {
    entityRow,
    buttons,
    busyBox,
  };
}

/******************************************************************************/
