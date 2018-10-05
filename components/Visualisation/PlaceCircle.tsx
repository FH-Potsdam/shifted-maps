import { Component, SyntheticEvent, createRef, RefObject } from 'react';
import { observer, inject } from 'mobx-react';
import { action } from 'mobx';
import styler, { Styler } from 'stylefire';
import { value, ValueReaction, spring } from 'popmotion';
import { HotSubscription } from 'popmotion/lib/reactions/types';

import styled from '../styled';
import PlaceCircleMap from './PlaceCircleMap';
import PlaceCircleModel from '../../store/PlaceCircle';
import { Stores } from './Visualisation';

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
  animate?: boolean;
};

@inject(
  ({ vis }: Stores): Partial<Props> => ({
    animate: vis && vis.animate,
  })
)
@observer
class PlaceCircle extends Component<Props> {
  ref: RefObject<SVGGElement>;
  styler?: Styler;
  pointValue: ValueReaction;
  pointSubscription?: HotSubscription;

  static defaultProps = {
    animate: false,
  };

  constructor(props: Props) {
    super(props);

    const { mapPoint } = props.placeCircle;

    this.ref = createRef();
    this.pointValue = value({ x: mapPoint.x, y: mapPoint.y });
  }

  createStyler() {
    if (this.ref.current == null) {
      return;
    }

    this.styler = styler(this.ref.current, {});
    this.pointSubscription = this.pointValue.subscribe(this.styler.set);
  }

  componentDidMount() {
    this.createStyler();
  }

  componentDidUpdate() {
    this.createStyler();

    if (this.styler == null) {
      return;
    }

    const { animate, placeCircle } = this.props;
    const { mapPoint } = placeCircle;

    if (animate) {
      spring({
        from: this.pointValue.get(),
        velocity: this.pointValue.getVelocity(),
        to: { x: mapPoint.x, y: mapPoint.y },
      }).start(this.pointValue);
    } else {
      this.pointValue.update({ x: mapPoint.x, y: mapPoint.y });
      this.styler.render();
    }
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
    const { placeCircle, className } = this.props;
    const { radius, strokeWidth, hover, visible } = placeCircle;

    if (!visible) {
      return null;
    }

    return (
      <g
        ref={this.ref}
        onMouseEnter={this.handleMouseEnter}
        onMouseLeave={this.handleMouseLeave}
        className={className}
      >
        <PlaceCircleBackground r={radius} />
        <PlaceCircleMap placeCircle={placeCircle} />
        <PlaceCircleStroke r={radius} style={{ strokeWidth: `${strokeWidth}px` }} hover={hover} />
      </g>
    );
  }
}

export default styled(PlaceCircle)`
  pointer-events: auto;

  .leaflet-dragging & {
    cursor: move;
    cursor: grabbing;
  }
`;
