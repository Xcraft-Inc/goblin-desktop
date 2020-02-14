/******************************************************************************/

export const propNames = ['showed'];

export default function styles(theme, props) {
  const {showed} = props;

  const desktopMonitors = {
    position: 'absolute',
    right: '10px',
    bottom: showed ? '10px' : '-420px',
    transition: showed ? '0.6s ease-out' : '0.7s ease-out',
    transitionTimingFunction: showed
      ? 'cubic-bezier(0.35, 1.5, 0.75, 1.0)'
      : 'cubic-bezier(0.9, -0.7, 0.85, 0.4)',
  };

  return {
    desktopMonitors,
  };
}

/******************************************************************************/
