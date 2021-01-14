import React from 'react';
import Widget from 'goblin-laboratory/widgets/widget';
import svg from 'goblin-gadgets/widgets/helpers/svg-helpers';

/******************************************************************************/

export default class Junction extends Widget {
  constructor() {
    super(...arguments);
  }

  //    x1
  // <------>
  //        o            ^    ^
  //        |            | y  |
  //        +-------|    v    | h
  //                |         |
  //                o         v
  // <-------------->
  //        x2

  get elements() {
    const path = svg.createPath();

    svg.ma(path, this.props.x1 + 0.5, 0);
    svg.la(path, this.props.x1 + 0.5, this.props.y + 0.5);
    svg.la(path, this.props.x2 + 0.5, this.props.y + 0.5);
    svg.la(path, this.props.x2 + 0.5, this.props.h + 0.5);

    const elements = svg.createElements();

    const props = {
      stroke: this.props.color,
      strokeWidth: '1px',
      strokeLinecap: 'round',
      strokeLinejoin: 'round',
      fill: 'none',
    };

    svg.pushPath(elements, path, props);

    return elements;
  }

  render() {
    return (
      <>{svg.renderElements(this.styles.classNames.junction, this.elements)}</>
    );
  }
}
