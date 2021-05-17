import React from 'react';
import Widget from 'goblin-laboratory/widgets/widget';
import Shredder from 'xcraft-core-shredder';
import T from 't';
import {ColorManipulator} from 'goblin-theme';
import StringBuilder from 'goblin-nabu/lib/string-builder';

import Label from 'goblin-gadgets/widgets/label/widget';
import Button from 'goblin-gadgets/widgets/button/widget';
import RetroIlluminatedButton from 'goblin-gadgets/widgets/retro-illuminated-button/widget';

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

  get isRetro() {
    return this.context.theme.look.name === 'retro';
  }

  getColor(type) {
    let color =
      {
        error: '#e60000', // red
        warning: '#ffc000', // orange
      }[type] || '#888';

    if (this.isRetro) {
      color = ColorManipulator.darken(color, 0.4);
    }

    return color;
  }

  getColorBackground(type) {
    return (
      {
        error: '#fed9d9', // light red
        warning: '#fff4d3', // light orange
      }[type] || '#888'
    );
  }

  getGlyph(type) {
    return (
      {
        error: 'solid/exclamation-triangle',
        warning: 'solid/info-square',
      }[type] || 'solid/bug'
    );
  }

  /******************************************************************************/

  renderGlyph(type, tooltip, width, index) {
    const color = this.getColor(type);
    const glyph = this.getGlyph(type);

    if (this.isRetro) {
      return (
        <>
          <RetroIlluminatedButton
            key={index}
            glyph={glyph}
            glyphSize="150%"
            width="40px"
            height="40px"
            material="led"
            color={color}
            backgroundColor={this.getColorBackground(type)}
            tooltip={tooltip}
          />
          <Label width={width ? null : '20px'} />
        </>
      );
    } else {
      return (
        <Label
          key={index}
          glyph={glyph}
          width={width || '60px'}
          glyphSize="180%"
          glyphColor={color}
          tooltip={tooltip}
        />
      );
    }
  }

  renderGlyphs(type, list) {
    const result = [];

    let count = list.size;
    let overflow = false;
    if (count > 3) {
      count = 3;
      overflow = true;
    }

    for (let i = 0; i < count; i++) {
      const tooltip = list.get(i).get('message');
      result.push(this.renderGlyph(type, tooltip, '40px', i));
    }

    if (overflow) {
      result.push(<Label key="last" text="..." fontSize="200%" />);
    }

    return result;
  }

  renderAlert(alert, index) {
    const {type, message, count} = alert.pick('type', 'message', 'count');

    const color = this.getColor(type);
    const style = {
      borderLeft: this.isRetro ? `30px solid ${color}` : `10px solid ${color}`,
      backgroundColor: this.getColorBackground(type),
    };

    return (
      <div
        key={index}
        className={this.styles.classNames.entityAlert}
        style={style}
      >
        {this.renderGlyph(type)}
        <Label text={message} grow="1" />
        {count > 1 ? <Label text={`(×${count})`} /> : null}
      </div>
    );
  }

  renderAlertExtended(errors, warnings) {
    return (
      <>
        {errors.map((alert, index) =>
          this.renderAlert(new Shredder(alert), index)
        )}
        {warnings.map((alert, index) =>
          this.renderAlert(new Shredder(alert), index)
        )}
      </>
    );
  }

  renderAlertCompacted(errors, warnings) {
    const nError = errors.size;
    const nWarning = warnings.size;

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

    const color = this.getColor(type);
    const style = {
      borderLeft: this.isRetro ? `30px solid ${color}` : `10px solid ${color}`,
      backgroundColor: this.getColorBackground(type),
    };

    return (
      <div className={this.styles.classNames.entityAlert} style={style}>
        {this.renderGlyphs('error', errors)}
        {this.renderGlyphs('warning', warnings)}
        <Label width="20px" />
        <Label text={message} />
      </div>
    );
  }

  renderAlerts(errors, warnings) {
    if (this.extended || errors.size + warnings.size === 1) {
      return this.renderAlertExtended(errors, warnings);
    } else {
      return this.renderAlertCompacted(errors, warnings);
    }
  }

  renderButton(errors, warnings) {
    if (errors.size + warnings.size === 1) {
      return null;
    }

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

  renderGroup(group, index) {
    const alerts = group.get('alerts');
    const errors = alerts.filter((a) => a.get('type') === 'error');
    const warnings = alerts.filter((a) => a.get('type') === 'warning');

    if (errors.size === 0 && warnings.size === 0) {
      return null;
    }

    const title = group.get('title', '');

    return (
      <div key={index} className={this.styles.classNames.entityAlerts}>
        {title}
        {this.renderAlerts(errors, warnings)}
        {this.renderButton(errors, warnings)}
      </div>
    );
  }

  render() {
    const {alerts} = this.props;
    if (!alerts) {
      return null;
    }
    return alerts.map((group, index) => this.renderGroup(group, index));
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
