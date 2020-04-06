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

  const clock = {
    'position': 'absolute',
    'right': '50px',
    'bottom': '50px',
    'transformOrigin': 'right bottom',
    'transition': 'all 0.5s ease',
    ':hover': {
      transform: 'scale(2)',
    },
  };

  /******************************************************************************/

  return {
    content,
    contentWithoutfooter,
    clock,
  };
}

/******************************************************************************/
