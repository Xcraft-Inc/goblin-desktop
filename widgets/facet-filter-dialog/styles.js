/******************************************************************************/

export default function styles(theme) {
  const facetFilterDialog = {
    position: 'absolute',
    top: '0px',
    bottom: '0px',
    left: '0px',
    right: '0px',
    display: 'flex',
    flexDirection: 'column',
  };

  const buttons = {
    padding: '20px 30px 0px 30px',
    flexGrow: 1,
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
  };

  const scrollable = {
    overflowY: 'auto',
  };

  const button = {
    minHeight: '20px',
    display: 'flex',
    flexDirection: 'row',
  };

  const letter = {
    margin: '20px 0px 5px 0px',
    borderBottom: `1px solid ${theme.palette.textColor}`,
  };

  const footer = {
    height: '50px',
    minHeight: '50px',
    padding: '0px 30px 10px 30px',
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: '0px 0px 3px 3px',
  };

  const closeButton = {
    position: 'absolute',
    top: '0px',
    right: '0px',
  };

  return {
    facetFilterDialog,
    buttons,
    scrollable,
    button,
    letter,
    footer,
    closeButton,
  };
}

/******************************************************************************/
