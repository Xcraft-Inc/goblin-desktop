//T:2019-02-28

import React from 'react';
import scrollIntoViewIfNeeded from 'scroll-into-view-if-needed';
import Widget from 'goblin-laboratory/widgets/widget';
import MouseTrap from 'mousetrap';
import Container from 'goblin-gadgets/widgets/container/widget';
import Label from 'goblin-gadgets/widgets/label/widget';
import Button from 'goblin-gadgets/widgets/button/widget';
import T from 't';

class _Row extends React.PureComponent {
  constructor() {
    super();
    this._ref = null;
  }

  componentDidUpdate() {
    if (this._ref && this.props.selected) {
      scrollIntoViewIfNeeded(this._ref, {
        duration: 100,
      });
    }
  }

  render() {
    const rowClick = () => {
      this.props.onRowClick
        ? this.props.onRowClick(this.props.rowIndex, this.props.text)
        : null;
    };

    const rowDbClick = () => {
      this.props.onRowDbClick
        ? this.props.onRowDbClick(this.props.rowIndex, this.props.text)
        : null;
    };
    return (
      <div
        ref={(node) => {
          this._ref = node;
        }}
        className={
          this.props.selected
            ? this.props.styles.boxActive
            : this.props.styles.box
        }
        onClick={rowClick}
        onDoubleClick={rowDbClick}
      >
        {this.props.glyph ? (
          <Label glyph={this.props.glyph} glyphPosition="center" />
        ) : null}
        <Label
          text={this.props.text}
          kind="large-single"
          justify="left"
          grow="1"
          wrap="no"
        />
      </div>
    );
  }
}

const Row = Widget.connect((s, p) => {
  const selectedIndex = s.get(`widgets.${p.id}.selectedIndex`);
  return {
    text: s.get(`backend.${p.id}.rows[${p.rowIndex}]`),
    glyph: s.get(`backend.${p.id}.glyphs[${p.rowIndex}]`),
    selected: selectedIndex === p.rowIndex,
  };
})(_Row);

class _List extends React.PureComponent {
  componentDidUpdate() {
    this.props.onInit(this.props.rows.size);
  }

  render() {
    return (
      <div>
        {this.props.rows.map((row, index) => {
          return (
            <Row
              key={index}
              id={this.props.id}
              rowIndex={index}
              styles={this.props.rowStyles}
              onRowClick={this.props.onRowClick}
              onRowDbClick={this.props.onRowDbClick}
            />
          );
        })}
      </div>
    );
  }
}

const List = Widget.connect((s, p) => {
  const rows = s.get(`backend.${p.id}.rows`, []);
  const glyphs = s.get(`backend.${p.id}.glyphs`, []);
  return {
    rows: rows,
    glyphs: glyphs,
  };
})(_List);

class Hinter extends Widget {
  constructor() {
    super(...arguments);
    this.onNew = this.onNew.bind(this);
    this.onKeyUp = this.onKeyUp.bind(this);
    this.onKeyDown = this.onKeyDown.bind(this);
    this.validate = this.validate.bind(this);
    this.validateRow = this.validateRow.bind(this);
    this.selectRow = this.selectRow.bind(this);
    this.prevRow = this.prevRow.bind(this);
    this.nextRow = this.nextRow.bind(this);
    this.initHinter = this.initHinter.bind(this);
    this.handleOutsideClick = this.handleOutsideClick.bind(this);
  }

  static get wiring() {
    return {
      id: 'id',
      type: 'type',
      kind: 'kind',
      title: 'title',
      glyph: 'glyph',
      status: 'status',
      onNew: 'onNew',
      withDetails: 'withDetails',
      newButtonTitle: 'newButtonTitle',
    };
  }

  componentDidMount() {
    super.componentDidMount();
    this.addOutsideClickListener();
  }

  UNSAFE_componentWillMount() {
    MouseTrap.bind('up', this.onKeyUp, 'keydown');
    MouseTrap.bind('down', this.onKeyDown, 'keydown');
    MouseTrap.bind('return', this.validate);
    MouseTrap.bind('tab', this.validate);
  }

  componentWillUnmount() {
    super.componentWillUnmount();
    MouseTrap.unbind('up');
    MouseTrap.unbind('down');
    MouseTrap.unbind('return');
    MouseTrap.unbind('tab');
    this.removeOutsideClickListener();
  }

  addOutsideClickListener() {
    document.addEventListener('mousedown', this.handleOutsideClick);
  }

  removeOutsideClickListener() {
    document.removeEventListener('mousedown', this.handleOutsideClick);
  }

  handleOutsideClick(e) {
    const target = e.target;
    const containers = [...document.getElementsByClassName('hinter-container')];
    if (!containers.some((container) => container.contains(target))) {
      this.do('hide');
      this.removeOutsideClickListener();
    }
  }

  onKeyUp() {
    this.prevRow();
  }

  onKeyDown() {
    this.nextRow();
  }

  nextRow() {
    const index = this.getSelectedIndex();
    if (parseInt(index) < this.getRows().size - 1) {
      this.dispatch({type: 'next-row'});
      this.do('next-row');
    }
  }

  prevRow() {
    const index = this.getSelectedIndex();
    if (parseInt(index) > 0) {
      this.dispatch({type: 'prev-row'});
      this.do('prev-row');
    }
  }

  selectRow(index, value) {
    if (parseInt(index) <= this.getRows().size - 1) {
      this.dispatch({type: 'select-row', index});
      this.do('select-row', {index, value});
    }
  }

  onNew() {
    const model = this.getRouting().get('location.hash').substring(1);
    const value = this.getModelValue(model, true);
    this.do('create-new', {value});
  }

  validate() {
    const index = this.getState()
      .widgets.get(this.props.id)
      .get('selectedIndex');
    this.validateRow(index);
  }

  validateRow(index) {
    this.do('validate-row', {
      index,
    });
  }

  getSelectedIndex() {
    return this.getBackendValue(`backend.${this.props.id}.selectedIndex`);
  }

  getRows() {
    return this.getBackendValue(`backend.${this.props.id}.rows`);
  }

  initHinter(rowCount) {
    this.dispatch({
      type: 'init-hinter',
      rowCount,
    });
  }

  render() {
    const {id, onNew, glyph, title, newButtonTitle} = this.props;

    if (!id) {
      return null;
    }

    return (
      <Container
        kind="view"
        grow="1"
        maxWidth="500px"
        addClassName="hinter-container"
      >
        <Container kind="pane-header-light">
          <Label kind="title" glyph={glyph} text={title} />
        </Container>
        <Container kind="panes">
          <Container kind="pane-top">
            <List
              id={id}
              rowStyles={this.styles.classNames}
              onRowClick={this.selectRow}
              onRowDbClick={this.validateRow}
              onInit={this.initHinter}
            />
          </Container>
        </Container>
        {onNew ? (
          <Container kind="actions">
            <Button
              kind="action"
              place="1/1"
              glyph="solid/plus"
              text={
                newButtonTitle
                  ? newButtonTitle
                  : T(`Nouveau {title}`, '', {title})
              }
              width="0px"
              grow="1"
              onClick={this.onNew}
            />
          </Container>
        ) : null}
      </Container>
    );
  }
}

export default Widget.Wired(Hinter);
