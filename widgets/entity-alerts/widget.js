import React from 'react';
import Widget from 'goblin-laboratory/widgets/widget';
import Shredder from 'xcraft-core-shredder';
import T from 't';

import Label from 'goblin-gadgets/widgets/label/widget';
import Button from 'goblin-gadgets/widgets/button/widget';
import StringBuilder from 'goblin-nabu/lib/string-builder';

/******************************************************************************/

function getColor(type) {
  return (
    {
      error: '#e60000', // red
      warning: '#ffc000', // orange
    }[type] || '#888'
  );
}

function getColorBackground(type) {
  return (
    {
      error: '#fed9d9', // light red
      warning: '#fff4d3', // light orange
    }[type] || '#888'
  );
}

function getGlyph(type) {
  return (
    {
      error: 'solid/exclamation-triangle',
      warning: 'solid/info-square',
    }[type] || 'solid/bug'
  );
}

/******************************************************************************/

class EntityAlerts extends Widget {
  constructor() {
    super(...arguments);

    this.state = {
      extended: false,
    };
  }

  //#region get/set
  get extended() {
    return this.state.extended;
  }
  set extended(value) {
    this.setState({
      extended: value,
    });
  }
  //#endregion

  /******************************************************************************/

  renderGlyph(type, width, index) {
    const color = getColor(type);
    const glyph = getGlyph(type);

    return (
      <Label
        key={index}
        glyph={glyph}
        width={width || '60px'}
        glyphSize="180%"
        glyphColor={color}
      />
    );
  }

  renderGlyphs(type, count) {
    const result = [];

    let overflow = false;
    if (count > 3) {
      count = 3;
      overflow = true;
    }

    for (let i = 0; i < count; i++) {
      result.push(this.renderGlyph(type, '40px', i));
    }

    if (overflow) {
      result.push(<Label text="..." fontSize="200%" />);
    }

    return result;
  }

  renderAlert(alert, index) {
    const {type, message, count} = alert.pick('type', 'message', 'count');

    const color = getColor(type);
    const style = {
      borderLeft: `10px solid ${color}`,
      backgroundColor: getColorBackground(type),
    };

    return (
      <div
        key={index}
        className={this.styles.classNames.entityAlert}
        style={style}
      >
        {this.renderGlyph(type)}
        <Label text={message} />
      </div>
    );
  }

  renderAlertExtended(alerts) {
    return alerts.map((alert, index) =>
      this.renderAlert(new Shredder(alert), index)
    );
  }

  renderAlertCompacted(alerts) {
    const nError = alerts.filter((a) => a.get('type') === 'error').size;
    const nWarning = alerts.filter((a) => a.get('type') === 'warning').size;

    if (nError === 0 && nWarning === 0) {
      return null;
    }

    const a = [];
    if (nError === 1) {
      a.push(T('1 erreur'));
    }
    if (nError > 1) {
      a.push(T(`${nError} erreurs`, null, {nError}));
    }
    if (nWarning === 1) {
      a.push(T('1 avertissement'));
    }
    if (nWarning > 1) {
      a.push(T(`${nWarning} avertissements`, null, {nWarning}));
    }
    const message = StringBuilder.joinSentences(a);

    const type = nError > 0 ? 'error' : 'warning';

    const color = getColor(type);
    const style = {
      borderLeft: `10px solid ${color}`,
      backgroundColor: getColorBackground(type),
    };

    return (
      <div className={this.styles.classNames.entityAlert} style={style}>
        {this.renderGlyphs('error', nError)}
        {this.renderGlyphs('warning', nWarning)}
        <Label width="20px" />
        <Label text={message} />
      </div>
    );
  }

  renderAlerts(alerts) {
    if (this.extended) {
      return this.renderAlertExtended(alerts);
    } else {
      return this.renderAlertCompacted(alerts);
    }
  }

  renderButton() {
    return (
      <div className={this.styles.classNames.button}>
        <Button
          glyph={this.extended ? 'solid/caret-up' : 'solid/caret-down'}
          border="none"
          width="30px"
          height="30px"
          onClick={() => (this.extended = !this.extended)}
        />
      </div>
    );
  }

  render() {
    const {alerts} = this.props;
    if (!alerts) {
      return null;
    }

    return (
      <div className={this.styles.classNames.entityAlerts}>
        {this.renderAlerts(alerts)}
        {this.renderButton()}
      </div>
    );
  }
}

/******************************************************************************/

const ConnectedEntityAlerts = Widget.connect((state, props) => {
  if (!props.entityId) {
    return {};
  }
  const alerts = state.get(`backend.${props.entityId}.meta.alerts`);
  if (!alerts) {
    return {};
  }
  return {
    alerts,
  };
})(EntityAlerts);

export default ConnectedEntityAlerts;
