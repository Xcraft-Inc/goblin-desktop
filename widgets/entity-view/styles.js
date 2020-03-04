import {Unit} from 'electrum-theme';

/******************************************************************************/

export default function styles(theme) {
  const entityView = {
    position: 'relative',
    margin: '0px',
    padding: '20px 0px 0px 0px',
    overflowX: 'hidden',
    overflowY: 'hidden',
    display: 'flex',
    flexDirection: 'column',
    backgroundColor: theme.palette.paneBackground,
  };

  const list = {
    width: '100%',
    height: '100%',
    overflowX: 'auto',
    overflowY: 'hidden',
    display: 'flex',
    flexDirection: 'column',
    flexGrow: '1',
  };

  const content = {
    height: '100%',
    overflowX: 'hidden',
    overflowY: 'hidden',
    display: 'flex',
    flexDirection: 'column',
    flexGrow: '1',
  };

  // Assumes the presence of a vertical scroller.
  // When there are none, the header columns do not match the columns in the list!
  const mr = Unit.add('20px', theme.shapes.scrollerThickness);

  const header = {
    minHeight: '24px',
    padding: `0px ${mr} 0px 20px`,
    borderBottom: '1px solid #888',
    display: 'flex',
    flexDirection: 'row',
    flexGrow: '1',
  };

  const rows = {
    height: '100%',
    overflowX: 'hidden',
    overflowY: 'auto',
    display: 'flex',
    flexDirection: 'column',
    flexGrow: '1',
  };

  const button = {
    position: 'absolute',
    top: '13px',
    right: '-2px',
  };

  return {
    entityView,
    list,
    content,
    header,
    rows,
    button,
  };
}

/******************************************************************************/
