'use strict';
//T:2019-05-24

import T from 't';
import Widget from 'laboratory/widget';
import React from 'react';
import Container from 'gadgets/container/widget';
import Button from 'gadgets/button/widget';
import {getToolbarId} from 'goblin-nabu/lib/helpers.js';

export default class NabuToolbar extends Widget {
  constructor() {
    super(...arguments);
    this.openLocaleSearch = this.openLocaleSearch.bind(this);
    this.toggleEnabled = this.toggleEnabled.bind(this);
    this.toggleMarks = this.toggleMarks.bind(this);
    this.toggleSelectionMode = this.toggleSelectionMode.bind(this);
    this.openDatagrid = this.openDatagrid.bind(this);
    this.openSingleEntity = this.openSingleEntity.bind(this);
    this.extract = this.extract.bind(this);
    this.pack = this.pack.bind(this);
  }

  static get wiring() {
    return {
      id: 'id',
      show: 'show',
      enabled: 'enabled',
      marker: 'marker',
      focus: 'focus',
      selectionMode: 'selectionMode.enabled',
      selectedItem: 'selectionMode.selectedItemId',
    };
  }

  static connectTo(instance) {
    return Widget.Wired(NabuToolbar)(getToolbarId(instance.props.id));
  }

  openLocaleSearch() {
    this.do('open-locale-search', {});
  }

  localeSearch() {
    this.do('open-locale-search', {});
  }

  toggleEnabled() {
    this.do('toggle-enabled', {});
  }

  toggleMarks() {
    this.do('toggle-marks', {});
  }

  toggleSelectionMode() {
    this.do('toggle-selection-mode', {});
  }

  openDatagrid() {
    this.do('open-datagrid', {});
  }

  openSingleEntity(entityId) {
    this.do('open-single-entity', {entityId});
  }

  extract() {
    this.cmd('nabu.extract-messages', {
      desktopId: this.props.desktopId,
    });
  }

  pack() {
    this.cmd('nabu.pack-messages', {
      desktopId: this.props.desktopId,
    });
  }

  render() {
    const {show, enabled, marker, selectionMode, selectedItem} = this.props;

    if (!show) {
      return <div />;
    }

    if (enabled) {
      return (
        <Container kind="row">
          <Button
            kind="button-footer"
            text={T('ҊȺɃՍ')}
            onClick={this.toggleEnabled}
          />
          <Button
            kind="button-footer"
            text={T('Search locales')}
            onClick={this.openLocaleSearch}
          />
          <Button
            kind="button-footer"
            text={T('Marker {marker, select, false {on} other {off}}', null, {
              marker: !!marker,
            })}
            onClick={this.toggleMarks}
          />
          <Button
            kind="button-footer"
            text={T(
              'Select. mode {mode, select, false {on} other {off}}',
              null,
              {mode: !!selectionMode}
            )}
            onClick={this.toggleSelectionMode}
          />
          <Button
            kind="button-footer"
            text={T(`Modify all messages`)}
            onClick={this.openDatagrid}
          />
          {selectedItem && selectionMode ? (
            <Button
              kind="button-footer"
              text={T(`Modify single message`)}
              onClick={() => this.openSingleEntity(selectedItem)}
            />
          ) : null}
          <Button
            kind="button-footer"
            text={T(`Extract all messages`)}
            onClick={this.extract}
          />
          <Button
            kind="button-footer"
            text={T(`Pack all messages`)}
            onClick={this.pack}
          />
        </Container>
      );
    } else {
      return (
        <Container kind="row">
          <Button
            kind="button-footer"
            text={T('ҊȺɃՍ')}
            onClick={this.toggleEnabled}
          />
        </Container>
      );
    }
  }
}
