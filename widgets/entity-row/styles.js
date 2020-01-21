/******************************************************************************/

export const propNames = ['height', 'selected'];

export default function styles(theme, props) {
  const {height, selected} = props;

  const entityRow = {
    'position': 'relative',
    'height': height,
    'display': 'flex',
    'flexDirection': 'row',
    'alignItems': 'center',
    'marginRight': '14px',
    'padding': '0px 20px',
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
      right: '-14px',
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
    right: '-85px',
  };

  return {
    entityRow,
    buttons,
  };
}

/******************************************************************************/
