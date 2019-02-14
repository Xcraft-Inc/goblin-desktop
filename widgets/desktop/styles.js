/******************************************************************************/

export default function styles(theme, props) {
  const content = {
    position: 'relative',
    display: 'flex',
    flexGrow: '1',
    flexBasis: '0',
    flexShrink: '1',
    marginBottom: '0px',
    transition: 'all 1s ease-out',
  };

  const contentWithoutfooter = {
    ...content,
    marginBottom: '-' + theme.shapes.footerHeight,
  };

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

  return {
    content,
    contentWithoutfooter,
    footer,
    footerHidden,
  };
}

/******************************************************************************/
