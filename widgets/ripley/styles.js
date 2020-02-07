import {Unit} from 'electrum-theme';

/******************************************************************************/

export default function styles(theme) {
  const m = theme.shapes.containerMargin;

  const colorFrom = 'rgba(0,255,0, 0.2)'; // light green
  const colorTo = 'rgba(255,0,0, 0.2)'; // light red

  const ripley = {
    margin: Unit.multiply(m, -1),
    display: 'flex',
    flexDirection: 'row',
    flexGrow: 1,
    overflowY: 'auto',
    background: `linear-gradient(90deg, ${colorFrom} 0%, ${colorTo})`,
  };

  const ripleyTree = {
    display: 'flex',
    flexDirection: 'column',
    flexGrow: 1,
    flexBasis: 0,
    padding: m,
  };

  const ripleyArrow = {
    height: '100px',
    display: 'flex',
  };

  return {
    ripley,
    ripleyTree,
    ripleyArrow,
  };
}

/******************************************************************************/
