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

  const radios = {
    height: '50px',
    minHeight: '50px',
    display: 'flex',
    flexDirection: 'column',
    borderRadius: '3px 3px 0px 0px',
    backgroundColor: theme.palette.paneNavigatorBackground,
  };

  const checkList = {
    display: 'flex',
    flexDirection: 'column',
    padding: '10px 30px',
  };

  const content = {
    padding: '0px 30px',
    flexGrow: 1,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    overflow: 'hidden',
  };

  const fields = {
    display: 'flex',
    flexDirection: 'row',
  };

  const junctions = {
    position: 'relative',
    width: '480px',
    height: '30px',
  };

  const sliders = {
    display: 'flex',
    flexDirection: 'column',
  };

  const minmax = {
    display: 'flex',
    flexDirection: 'row',
    marginTop: '4px',
  };

  const closeButton = {
    position: 'absolute',
    top: '0px',
    right: '0px',
  };

  return {
    facetFilterDialog,

    radios,
    checkList,

    content,
    fields,
    junctions,
    sliders,
    minmax,

    closeButton,
  };
}

/******************************************************************************/
