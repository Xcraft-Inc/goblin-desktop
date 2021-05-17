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
        info: '#00b42a', // green
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
        info: '#d9fedb', // light green
      }[type] || '#888'
    );
  }

  getGlyph(type) {
    return (
      {
        error: 'solid/exclamation-triangle',
        warning: 'solid/info-square',
        info: 'solid/book',
      }[type] || 'solid/bug'
    );
  }

  /******************************************************************************/

  renderGlyph(type, width, index) {
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
        />
      );
    }
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
      result.push(<Label key="last" text="..." fontSize="200%" />);
    }

    return result;
  }

  renderAlert(alert, index) {
    const {type, message} = alert.pick('type', 'message');

    const style = {
      backgroundColor: this.getColorBackground(type),
    };

    return (
      <div key={index} className={this.styles.classNames.alert} style={style}>
        {this.renderGlyph(type)}
        <Label text={message} />
      </div>
    );
  }

  renderAlerts(errors, warnings, infos) {
    return (
      <>
        {errors.map((alert, index) =>
          this.renderAlert(new Shredder(alert), index)
        )}
        {warnings.map((alert, index) =>
          this.renderAlert(new Shredder(alert), index)
        )}
        {infos.map((alert, index) =>
          this.renderAlert(new Shredder(alert), index)
        )}
      </>
    );
  }

  renderGroup(group, index) {
    const alerts = group.get('alerts');
    const errors = alerts.filter((a) => a.get('type') === 'error');
    const warnings = alerts.filter((a) => a.get('type') === 'warning');
    const infos = alerts.filter((a) => a.get('type') === 'info');

    if (errors.size === 0 && warnings.size === 0 && infos.size === 0) {
      return null;
    }

    let type = '#ccc';
    if (infos.size > 0) {
      type = 'info';
    }
    if (warnings.size > 0) {
      type = 'warning';
    }
    if (errors.size > 0) {
      type = 'error';
    }

    const color = this.getColor(type);
    const style = {
      borderLeft: this.isRetro ? `30px solid ${color}` : `10px solid ${color}`,
      backgroundColor: this.getColorBackground(type),
    };

    const title = group.get('title', null);

    return (
      <div key={index} className={this.styles.classNames.group} style={style}>
        {title ? (
          <div key={index} className={this.styles.classNames.title}>
            <Label kind="title" text={title} />
          </div>
        ) : null}
        {this.renderAlerts(errors, warnings, infos)}
      </div>
    );
  }

  renderAlertCompacted() {
    const {alerts} = this.props;

    const counts = alerts.reduce(
      (counts, group) => {
        counts.errors += group
          .get('alerts')
          .filter((a) => a.get('type') === 'error').size;
        counts.warnings += group
          .get('alerts')
          .filter((a) => a.get('type') === 'warning').size;
        counts.infos += group
          .get('alerts')
          .filter((a) => a.get('type') === 'info').size;
        return counts;
      },
      {errors: 0, warnings: 0, infos: 0}
    );

    const nError = counts.errors;
    const nWarning = counts.warnings;
    const nInfo = counts.infos;

    if (nError === 0 && nWarning === 0 && nInfo === 0) {
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
    if (nInfo === 1) {
      a.push(T('1 information'));
    }
    if (nInfo > 1) {
      a.push(T(`${nInfo} informations`, null, {nInfo}));
    }
    const message = StringBuilder.joinSentences(a);

    const type = nError > 0 ? 'error' : nWarning > 0 ? 'warning' : 'info';

    const color = this.getColor(type);
    const style = {
      borderLeft: this.isRetro ? `30px solid ${color}` : `10px solid ${color}`,
      backgroundColor: this.getColorBackground(type),
    };

    return (
      <div className={this.styles.classNames.compacted} style={style}>
        {this.renderGlyphs('error', nError)}
        {this.renderGlyphs('warning', nWarning)}
        {this.renderGlyphs('info', nInfo)}
        <Label width="20px" />
        <Label text={message} />
      </div>
    );
  }

  renderButton(total) {
    if (total === 1) {
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

  render() {
    const {alerts} = this.props;
    if (!alerts) {
      return null;
    }

    const total = alerts.reduce((count, group) => {
      count += group.get('alerts').size;
      return count;
    }, 0);

    if (total === 0) {
      return null;
    }

    return (
      <div className={this.styles.classNames.entityAlerts}>
        {this.extended || total === 1
          ? alerts.map((group, index) => this.renderGroup(group, index))
          : this.renderAlertCompacted()}
        {this.renderButton(total)}
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
