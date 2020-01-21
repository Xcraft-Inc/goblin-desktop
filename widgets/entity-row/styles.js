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
  };

  const buttons = {
    position: 'absolute',
    right: '0px',
    display: 'flex',
    flexDirection: 'row',
  };

  return {
    entityRow,
    buttons,
  };
}

/******************************************************************************/
