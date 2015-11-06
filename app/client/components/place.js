import React, { Component } from 'react';
import classNames from 'classnames';
import VelocityComponent from 'velocity-react/velocity-component';
import PlaceMap from './place-map';
import PlaceDeco from './place-deco';
import PlaceLabel from './place-label';

class Place extends Component {
  constructor(props) {
    super(props);

    this.state = {
      visible: props.node.visible
    };
  }

  shouldComponentUpdate(nextProps, nextState) {
    return this.state.visible !== nextState.visible ||
      this.props.node !== nextProps.node;
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.node.visible)
      this.setState({ visible: true });
  }

  onAnimationComplete() {
    this.setState({ visible: this.props.node.visible });
  }

  render() {
    let { node, onHover, animate } = this.props,
      { point, hover, rank } = node,
      { visible } = this.state,
      transform, animation;

    if (visible && !animate && point != null)
      transform = `translate(${point.x}, ${point.y})`;

    let className = classNames('place', { active: visible, hover });

    let place = (
      <g transform={transform}
         data-rank={rank}
         className={className}
         onMouseEnter={onHover.bind(this, true)}
         onMouseLeave={onHover.bind(this, false)}>
        <PlaceMap node={node} />
        <PlaceDeco node={node} />
        <PlaceLabel node={node} />
      </g>
    );

    if (animate && point != null) {
      animation = {
        translateX: point.x,
        translateY: point.y
      };

      place = (
        <VelocityComponent animation={animation} duration={200} complete={this.onAnimationComplete.bind(this)}>
          {place}
        </VelocityComponent>
      );
    }

    return place;
  }
}

export default Place;