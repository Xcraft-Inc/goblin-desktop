/******************************************************************************/

export const propNames = ['height', 'minHeight', 'selected'];

export default function styles(theme, props) {
  const {height, minHeight, selected} = props;

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
      : theme.palette.tableCellBackground,
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
    left: '10%',
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
