import { Component, SyntheticEvent, createRef, RefObject } from 'react';
import { observer } from 'mobx-react';
import { action } from 'mobx';
import styler, { Styler } from 'stylefire';
import { value, ValueReaction } from 'popmotion';
import { HotSubscription } from 'popmotion/lib/reactions/types';

import styled from '../styled';
import PlaceCircleMap from './PlaceCircleMap';
import PlaceCircleModel from '../../store/PlaceCircle';

const PlaceCircleBackground = styled.circle`
  fill: ${props => props.theme.backgroundColor};
  stroke: none;
`;

const PlaceCircleStroke = styled.circle<{ hover: boolean }>`
  transition: stroke ${props => props.theme.shortTransitionDuration};
  fill: none;
  stroke: ${props => (props.hover ? props.theme.highlightColor : props.theme.foregroundColor)};
`;

type Props = {
  placeCircle: PlaceCircleModel;
  className?: string;
};

@observer
class PlaceCircle extends Component<Props> {
  group: RefObject<SVGGElement>;
  groupStyler?: Styler;
  pointValue: ValueReaction;
  pointSubscription?: HotSubscription;

  constructor(props: Props) {
    super(props);

    const { layerPoint } = props.placeCircle;

    this.group = createRef();
    this.pointValue = value({ x: layerPoint.x, y: layerPoint.y });
  }

  componentDidMount() {
    if (this.group.current == null) {
      return;
    }

    this.groupStyler = styler(this.group.current, {});

    this.pointSubscription = this.pointValue.subscribe(this.groupStyler.set);
  }

  componentDidUpdate() {
    if (this.groupStyler == null) {
      return;
    }

    const { layerPoint } = this.props.placeCircle;

    this.pointValue.update({ x: layerPoint.x, y: layerPoint.y });
    this.groupStyler.render();
  }

  componentWillUnmount() {
    if (this.pointSubscription != null) {
      this.pointSubscription.unsubscribe();
    }
  }

  @action.bound
  handleMouseEnter(event: SyntheticEvent) {
    event.stopPropagation();

    this.props.placeCircle.hover = true;
  }

  @action.bound
  handleMouseLeave(event: SyntheticEvent) {
    event.stopPropagation();

    this.props.placeCircle.hover = false;
  }

  render() {
    const { placeCircle, ...props } = this.props;
    const { radius, strokeWidth, layerPoint, hover } = placeCircle;

    return (
      <g
        ref={this.group}
        onMouseEnter={this.handleMouseEnter}
        onMouseLeave={this.handleMouseLeave}
        {...props}
      >
        <PlaceCircleBackground r={radius} />
        <PlaceCircleMap size={radius * 2} />
        <PlaceCircleStroke r={radius} style={{ strokeWidth: `${strokeWidth}px` }} hover={hover} />
      </g>
    );
  }
}

export default styled(PlaceCircle)`
  pointer-events: auto;
`;
