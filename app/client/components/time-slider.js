import React, { Component } from 'react';
import { findDOMNode } from 'react-dom';
import classNames from 'classnames';
import offset from '../helpers/offset';

class TimeSlider extends Component {
  constructor(props) {
    super(props);

    this.state = {
      values: this.props.defaultValues
    };
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
    let element = findDOMNode(this),
      { left } = offset(element),
      width = element.offsetWidth;

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
  constructor(props) {
    super(props);

    this.state = {
      active: false
    };
  }

  onClick(event) {
    event.stopPropagation();
  }

  onMouseDown(event) {
    event.preventDefault();


    let offset_ = offset(findDOMNode(this)),
      left = event.pageX - offset_.left,
      top = event.pageY - offset_.top;

    this.setState({ active: true });

    let onMouseMove = event => {
      this.onMove(event.clientX - left, event.clientY - top);
    };

    let onMouseUp = event => {
      event.preventDefault();

      this.setState({ active: false });

      window.removeEventListener('mouseup', onMouseUp);
      window.removeEventListener('mousemove', onMouseMove);
    };

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
  }

  onMove(left, top) {
    this.props.onMove(left, top);
  }

  render() {
    let { position } = this.props,
      { active } = this.state;

    let style = {
      left: position * 100 + '%'
    };

    let className = classNames('time-slider__thumb', { active });

    return <div className={className} onMouseDown={this.onMouseDown.bind(this)} onClick={this.onClick.bind(this)} style={style} />;
  }
}

export default TimeSlider;