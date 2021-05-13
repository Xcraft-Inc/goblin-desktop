import {Unit, ColorManipulator} from 'goblin-theme';

/******************************************************************************/

export default function styles(theme) {
  const m = theme.shapes.containerMargin;
  const m12 = Unit.multiply(m, 0.5);
  const m14 = Unit.multiply(m, 0.25);
  const m34 = Unit.multiply(m, 0.75);

  const entityAlerts = {
    position: 'relative',
    minHeight: '30px',
    maxHeight: '40%',
    margin: `${Unit.multiply(m, -1)} 0px ${m} 0px`,
    display: 'flex',
    flexDirection: 'column',
    padding: `${m34} 0px`,
    boxShadow: '0px 0px 20px 0px rgba(0,0,0,0.3)',
    overflowY: 'auto',
  };

  const entityAlert = {
    display: 'flex',
    flexDirection: 'row',
    margin: `${m14} ${m}`,
    padding: `${m12} ${m} ${m12} ${m12}`,
    borderRadius: '4px',
    color: '#333',
    // + borderLeft: `10px solid ${color}`,
  };

  const button = {
    position: 'absolute',
    right: m,
    top: m,
  };

  /******************************************************************************/

  return {
    entityAlerts,
    entityAlert,
    button,
  };
}

/******************************************************************************/
