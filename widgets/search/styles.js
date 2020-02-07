/******************************************************************************/

export default function styles(theme) {
  const m = theme.shapes.containerMargin;

  const search = {
    position: 'relative',
    display: 'flex',
    flexDirection: 'row',
    flexGrow: 1,
    overflowX: 'auto',
    marginLeft: '0px',
    transition: '0.5s ease-out',
  };

  const searchWithoutParams = {
    ...search,
    marginLeft: '-305px',
  };

  const params = {
    width: '300px',
    minWidth: '300px',
    margin: '0px 5px 0px 0px',
    display: 'flex',
    flexDirection: 'column',
    backgroundColor: theme.palette.viewBackground,
  };

  const pane = {
    display: 'flex',
    flexDirection: 'column',
    margin: '0px 0px ' + m + ' 0px',
    padding: m + ' ' + m + ' ' + m + ' ' + m,
    backgroundColor: theme.palette.paneBackground,
  };

  const separator = {
    height: m,
  };

  const sajex = {
    flexGrow: 1,
  };

  const button = {
    position: 'absolute',
    left: '-1px',
    top: '-1px',
    transition: '0.5s ease-out',
  };

  const buttonWithoutParams = {
    ...button,
    left: '304px',
  };

  return {
    search,
    searchWithoutParams,
    params,
    pane,
    separator,
    sajex,
    button,
    buttonWithoutParams,
  };
}

/******************************************************************************/
