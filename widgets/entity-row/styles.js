/******************************************************************************/

export const propNames = ['height'];

export default function styles(theme, props) {
  const {height} = props;

  const even = {
    'height': height,
    'display': 'flex',
    'flexDirection': 'row',
    'alignItems': 'center',
    'padding': '0px 20px',
    'backgroundColor': theme.palette.paneBackground,
    'borderBottom': `1px solid ${theme.palette.viewBackground}`,
    'cursor': 'default',
    ':hover': {
      backgroundColor: theme.palette.viewBackground,
    },
  };

  const odd = {
    ...even,
    //- backgroundColor: '#eee',
  };

  return {
    even,
    odd,
  };
}

/******************************************************************************/
