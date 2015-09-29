import React, { Component } from 'react';
import { findDOMNode } from 'react-dom';
import $ from 'jquery';

class TimeSlider extends Component {
  constructor(props) {
    super(props);

    this.state = {
      values: this.props.defaultValues
    };
  }

  componentDidMount() {
    this.$element = $(findDOMNode(this));
  }

  componentDidUpdate() {
    this.$element = $(findDOMNode(this));
  }

  start() {
    return this.props.start || this.props.defaultValues[0];
  }

  end() {
    return this.props.end || this.props.defaultValues[1];
  }

  onThumbMove(key, thumbLeft, thumbTop) {
    let value = this.computeValue(thumbLeft, thumbTop);

    this.changeValue(key, value);
  }

  computeValue(valueLeft) {
    let $element = this.$element,
      { left } = $element.offset(),
      width = $element.width();

    let position = (Math.max(left, Math.min(left + width, valueLeft)) - left) / width,
      start = this.start(),
      end = this.end();

    return position * (end - start) + start;
  }

  changeValue(key, value) {
    let { distance, step } = this.props,
      start = this.start(),
      end = this.end(),
      { values } = this.state,
      prevValue = values[key];

    value = this.normalize(value);

    if (prevValue === value)
      return;

    if (value > end)
      value -= step;

    let nextValues = [...values],
      movingLeft = value <= prevValue,
      otherValues = values.slice.apply(values, movingLeft ? [0, key] : [key + 1]);

    nextValues[key] = value;

    if (!movingLeft)
      otherValues = otherValues.reverse();

    for (let i = 0; i < otherValues.length; i++) {
      let otherValue = otherValues[i],
        otherKey = movingLeft ? i : values.length - i - 1,
        nextValue = otherValue;

      if (movingLeft) {
        if (value < nextValue)
          nextValue = value - step;
      } else if (value > nextValue) {
        nextValue = value + step;
      }

      let valueDistance = Math.abs(value - otherValue),
        keyDistance = Math.abs(key - otherKey),
        minDistance = distance * keyDistance;

      if (valueDistance < minDistance)
        nextValue += Math.abs(valueDistance - minDistance) * (movingLeft ? -1 : 1);

      nextValue = this.normalize(nextValue);

      if (nextValue < start || nextValue > end)
        return;

      nextValues[otherKey] = nextValue;
    }

    this.setState({
      values: nextValues
    });

    this.props.onChange(nextValues);
  }

  normalize(value) {
    let { step } = this.props;

    return Math.round(value / step) * step;
  }

  renderThumbs() {
    let start = this.start(),
      end = this.end(),
      { values } = this.state;

    return values.map((value, key) => {
      let onMove = (left, top) => {
        this.onThumbMove(key, left, top);
      };

      value = this.normalize(value);

      let position = (value - start) / (end - start);

      return <Thumb key={key} position={position} onMove={onMove} />
    });
  }

  onClick(event) {
    event.stopPropagation();

    let { values } = this.state,
      clickValue = this.computeValue(event.pageX, event.pageY),
      clickKey = null,
      clickDistance = Infinity;

    values.forEach(function(value, key) {
      let distance = Math.abs(clickValue - value);

      if (clickDistance > distance) {
        clickDistance = distance;
        clickKey = key;
      }
    });

    this.changeValue(clickKey, clickValue);
  }

  render() {
    let thumbs = this.renderThumbs();

    return (
      <div className="time-slider" onClick={this.onClick.bind(this)}>
        <div ref="track" className="time-slider__track" />
        {thumbs}
      </div>
    );
  }
}

class Thumb extends Component {
  componentDidMount() {
    this.$element = $(findDOMNode(this));
  }

  componentDidUpdate() {
    this.$element = $(findDOMNode(this));
  }

  onClick(event) {
    event.stopPropagation();
  }

  onMouseDown(event) {
    event.preventDefault();

    let offset = this.$element.offset(),
      left = event.pageX - offset.left,
      top = event.pageY - offset.top;

    let onMouseMove = event => {
      this.onMove(event.clientX - left, event.clientY - top);
    };

    let onMouseUp = event => {
      event.preventDefault();

      $(window).off('mousemove', onMouseMove);
    };

    $(window)
      .on('mousemove', onMouseMove)
      .one('mouseup', onMouseUp);
  }

  onMove(left, top) {
    this.props.onMove(left, top);
  }

  render() {
    let { position } = this.props;

    let style = {
      left: position * 100 + '%'
    };

    return <div className="time-slider__thumb" onMouseDown={this.onMouseDown.bind(this)} onClick={this.onClick.bind(this)} style={style} />;
  }
}

export default TimeSlider;