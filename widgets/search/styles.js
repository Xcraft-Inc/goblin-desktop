import {Unit} from 'electrum-theme';

/******************************************************************************/

export default function styles(theme) {
  const m = theme.shapes.containerMargin;
  const d = Unit.multiply(m, 0.5);

  const search = {
    display: 'flex',
    flexDirection: 'row',
    flexGrow: 1,
    overflowX: 'auto',
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

  const lastPane = {
    ...pane,
    margin: '0px',
  };

  const separator = {
    height: m,
  };

  const sajex = {
    flexGrow: 1,
  };

  return {
    search,
    params,
    pane,
    lastPane,
    separator,
    sajex,
  };
}

/******************************************************************************/
