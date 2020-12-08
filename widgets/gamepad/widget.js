import React from 'react';
import Widget from 'goblin-laboratory/widgets/widget';
import {fromJS} from 'immutable';

class GamePad extends Widget {
  constructor() {
    super(...arguments);
  }

  UNSAFE_componentWillReceiveProps() {
    if (this.props.gamepad) {
      this.doFor(this.props.id, 'gamepad-changed', {
        gamepad: this.props.gamepad,
      });
    }
  }

  render() {
    console.log('gamepad react');
    return null;
  }
}

class GamePads extends Widget {
  constructor() {
    super(...arguments);
    this.state = {gamepads: []};
    this.pollGamepads = this.pollGamepads.bind(this);
  }

  tick() {
    this.setState({gamepads: this.pollGamepads()});
    window.requestAnimationFrame(() => this.tick());
  }

  pollGamepads() {
    return navigator.getGamepads();
  }

  componentDidMount() {
    this.tick();
  }

  render() {
    const gamepads = [].slice.call(this.state.gamepads);
    return (
      <React.Fragment>
        {gamepads.map((g, i) => {
          if (!g) {
            return null;
          }
          const {id, index, connected, mapping, buttons, axes} = g;
          return (
            <GamePad
              id={this.props.id}
              gamepad={Widget.shred(
                fromJS({
                  id,
                  index,
                  connected,
                  mapping,
                  buttons: buttons.map((b) => b.value),
                  axes,
                })
              )}
              key={i}
              controller={i}
            />
          );
        })}
      </React.Fragment>
    );
  }
}

export default GamePads;
