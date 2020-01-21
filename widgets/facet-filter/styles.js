/******************************************************************************/

export default function styles(theme) {
  const dialogContent = {
    position: 'absolute',
    top: '0px',
    bottom: '0px',
    left: '0px',
    right: '0px',
    display: 'flex',
    flexDirection: 'column',
  };

  const dialogHeader = {
    height: '50px',
    padding: '20px 30px 20px 30px',
    display: 'flex',
    flexDirection: 'row',
    borderRadius: '3px 3px 0px 0px',
    backgroundColor: theme.palette.tableSelectedBackground,
  };

  const dialogButtons = {
    padding: '20px 30px 20px 30px',
    flexGrow: 1,
    display: 'flex',
    flexDirection: 'row',
    flexWrap: 'wrap',
    backgroundColor: theme.palette.viewBackground,
  };

  const dialogFooter = {
    height: '50px',
    padding: '20px 30px 20px 30px',
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: '0px 0px 3px 3px',
    backgroundColor: theme.palette.paneBackground,
    boxShadow: 'rgba(0, 0, 0, 0.2) 0px 0px 50px',
  };

  const sajex = {
    flexGrow: 1,
  };

  return {
    dialogContent,
    dialogHeader,
    dialogButtons,
    dialogFooter,
    sajex,
  };
}

/******************************************************************************/
