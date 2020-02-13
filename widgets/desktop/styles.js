/******************************************************************************/

export default function styles(theme) {
  const content = {
    position: 'relative',
    display: 'flex',
    flexGrow: '1',
    flexBasis: '0',
    flexShrink: '1',
    marginBottom: '0px',
    transition: 'all 1s ease-out',
  };

  const contentWithoutfooter = {
    ...content,
    marginBottom: '-' + theme.shapes.footerHeight,
  };

  const footer = {
    position: 'relative',
    minHeight: theme.shapes.footerHeight,
    maxHeight: theme.shapes.footerHeight,
    display: 'flex',
    flexDirection: 'row',
    flexGrow: 0,
    justifyContent: 'flex-start',
    alignItems: 'center',
    backgroundColor: theme.palette.footerBackground,
    top: '0px',
    transition: 'all 1s ease-out',
  };

  const footerHidden = {
    ...footer,
    top: theme.shapes.footerHeight,
  };

  const footerSampleMonitors = {
    display: 'none',
    // display: 'flex',
    flexDirection: 'row',
    flexGrow: 1,
    justifyContent: 'flex-end',
  };

  const footerSampleMonitor = {
    position: 'absolute',
    right: '10px',
    bottom: '10px',
    // transition: '0.7s ease-out',
    // transitionTimingFunction: 'cubic-bezier(0.6, 2.5, 0.5, 0.35)', // bounce
    transition: '0.5s ease-out',
    transitionTimingFunction: 'cubic-bezier(0.35, 1.5, 0.75, 1.0)',
  };

  const footerSampleMonitorHidden = {
    ...footerSampleMonitor,
    bottom: '-420px',
  };

  return {
    content,
    contentWithoutfooter,
    footer,
    footerHidden,
    footerSampleMonitors,
    footerSampleMonitor,
    footerSampleMonitorHidden,
  };
}

/******************************************************************************/
