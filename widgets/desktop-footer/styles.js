/******************************************************************************/

export default function styles(theme) {
  const footer = {
    position: 'relative',
    minHeight: theme.shapes.footerHeight,
    maxHeight: theme.shapes.footerHeight,
    display: 'flex',
    flexDirection: 'row',
    flexGrow: 0,
    justifyContent: 'flex-start',
    alignItems: 'center',
    backgroundColor: theme.palette.footerBackground,
    top: '0px',
    transition: 'all 1s ease-out',
  };

  const footerHidden = {
    ...footer,
    top: theme.shapes.footerHeight,
  };

  /******************************************************************************/

  return {
    footer,
    footerHidden,
  };
}

/******************************************************************************/
