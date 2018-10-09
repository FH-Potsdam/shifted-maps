import { Component, SyntheticEvent, RefObject, createRef } from 'react';
import { observer } from 'mobx-react';
import { action, IReactionDisposer, autorun } from 'mobx';
import { ValueReaction, value, spring } from 'popmotion';
import styler, { Styler } from 'stylefire';

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
  private ref: RefObject<SVGGElement>;
  private pointValue: ValueReaction;
  private styler?: Styler;
  private updateSubscription?: IReactionDisposer;

  constructor(props: Props) {
    super(props);

    const { point } = props.placeCircle;

    this.ref = createRef();
    this.pointValue = value({ x: point.x, y: point.y });
  }

  componentDidMount() {
    this.startStyler();
  }

  componentDidUpdate() {
    this.startStyler();
  }

  componentWillUnmount() {
    if (this.updateSubscription != null) {
      this.updateSubscription();
    }
  }

  private startStyler() {
    if (this.ref.current == null) {
      return;
    }

    this.styler = styler(this.ref.current, {});
    this.pointValue.subscribe(this.styler.set);

    if (this.updateSubscription != null) {
      this.updateSubscription();
    }

    this.updateSubscription = autorun(this.style);
  }

  private style = () => {
    const { point, animate } = this.props.placeCircle;

    if (animate) {
      spring({
        from: this.pointValue.get(),
        to: { x: point.x, y: point.y },
        velocity: this.pointValue.getVelocity(),
        stiffness: 3000,
        damping: 1000,
      }).start(this.pointValue);
    } else {
      this.pointValue!.update({ x: point.x, y: point.y });
      this.styler!.render();
    }
  };

  @action.bound
  private handleMouseEnter(event: SyntheticEvent) {
    event.stopPropagation();

    this.props.placeCircle.hover = true;
  }

  @action.bound
  private handleMouseLeave(event: SyntheticEvent) {
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
