import {Unit, ColorManipulator} from 'goblin-theme';

/******************************************************************************/

export default function styles(theme) {
  const m = theme.shapes.containerMargin;
  const m12 = Unit.multiply(m, 0.5);
  const m14 = Unit.multiply(m, 0.25);
  const m34 = Unit.multiply(m, 0.75);

  const isRetro = theme.look.name === 'retro';

  const entityAlerts = {
    position: 'relative',
    minHeight: '30px',
    maxHeight: '40%',
    margin: `${Unit.multiply(m, -1)} 0px ${m} 0px`,
    display: 'flex',
    flexDirection: 'column',
    padding: isRetro ? '25px 0px' : `${m34} 0px`,
    boxShadow: '0px 0px 20px 0px rgba(0,0,0,0.3)',
    overflowY: 'auto',
  };

  const group = {
    display: 'flex',
    flexDirection: 'column',
    margin: isRetro ? '-5px 20px' : `${m14} ${m}`,
    padding: isRetro ? '20px 20px 20px 10px' : `${m12} ${m} ${m12} ${m12}`,
    borderRadius: isRetro ? '25px 25px 2px 2px' : '4px',
    color: '#333',
    border: isRetro ? '1px solid #777' : null,
    boxShadow: isRetro ? 'rgba(0, 0, 0, 0.5) 2px 6px 50px 0px inset' : null,
    // + borderLeft: `10px solid ${color}`,
    // + backgroundColor: color,
  };

  const compacted = {
    ...group,
    flexDirection: 'row',
  };

  const alert = {
    display: 'flex',
    flexDirection: 'row',
    borderRadius: isRetro ? '26px' : '4px',
    border: isRetro ? '1px solid #aaa' : null,
    boxShadow: isRetro ? '0px 5px 10px 0px rgba(0,0,0,0.3)' : null,
    margin: isRetro ? '0px 0px 2px 0px' : null,
    // + backgroundColor: color,
  };

  const title = {
    margin: '0px 0px 10px 58px',
  };

  const button = {
    position: 'absolute',
    right: m,
    top: m,
  };

  /******************************************************************************/

  return {
    entityAlerts,
    group,
    compacted,
    title,
    alert,
    button,
  };
}

/******************************************************************************/
