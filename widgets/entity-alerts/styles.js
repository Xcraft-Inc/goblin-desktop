import {Unit, ColorManipulator} from 'goblin-theme';

/******************************************************************************/

export default function styles(theme) {
  const m = theme.shapes.containerMargin;
  const mm = Unit.multiply(m, 0.5);
  const mmm = Unit.multiply(m, 0.25);

  const entityAlerts = {
    position: 'relative',
    minHeight: '30px',
    maxHeight: '40%',
    margin: `${Unit.multiply(m, -1)} ${mm} ${mm} ${mm}`,
    display: 'flex',
    flexDirection: 'column',
    padding: '5px 0px',
    overflowY: 'auto',
  };

  const entityAlert = {
    display: 'flex',
    flexDirection: 'row',
    margin: `${mmm} ${mm}`,
    padding: `${mm} ${m} ${mm} ${mm}`,
    borderRadius: '4px',
    backgroundColor: '#fff',
    color: '#333',
    // + borderLeft: `10px solid ${color}`,
  };

  const button = {
    position: 'absolute',
    right: mm,
    top: mm,
  };

  /******************************************************************************/

  return {
    entityAlerts,
    entityAlert,
    button,
  };
}

/******************************************************************************/
