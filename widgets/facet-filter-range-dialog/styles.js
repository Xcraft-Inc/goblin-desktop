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

  const content = {
    padding: '20px 30px 0px 30px',
    flexGrow: 1,
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
  };

  const fields = {
    display: 'flex',
    flexDirection: 'row',
    marginBottom: '30px',
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
    content,
    fields,
    sliders,
    minmax,
    closeButton,
  };
}

/******************************************************************************/
