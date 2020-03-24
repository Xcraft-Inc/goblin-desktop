/******************************************************************************/

export default function styles(theme) {
  const content = {
    position: 'relative',
    display: 'flex',
    flexGrow: '1',
    flexBasis: '0',
    flexShrink: '1',
    marginBottom: '0px',
    transition: 'all 1s ease-out',
    overflow: 'hidden',
  };

  const contentWithoutfooter = {
    ...content,
    marginBottom: '-' + theme.shapes.footerHeight,
  };

  /******************************************************************************/

  return {
    content,
    contentWithoutfooter,
  };
}

/******************************************************************************/
