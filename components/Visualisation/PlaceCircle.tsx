import { Component, SyntheticEvent, RefObject, createRef } from 'react';
import { observer } from 'mobx-react';
import { action, IReactionDisposer, autorun } from 'mobx';
import { ValueReaction, value } from 'popmotion';
import styler, { Styler } from 'stylefire';
import { HotSubscription } from 'popmotion/lib/reactions/types';

import styled from '../styled';
import PlaceCircleMap from './PlaceCircleMap';
import PlaceCircleModel from '../../store/PlaceCircle';
import PlaceCircleLabel from './PlaceCircleLabel';

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
  private valueSubscribtion?: HotSubscription;

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

    if (this.valueSubscribtion != null) {
      this.valueSubscribtion.unsubscribe();
    }
  }

  private startStyler() {
    if (this.ref.current == null) {
      return;
    }

    if (this.valueSubscribtion != null) {
      this.valueSubscribtion.unsubscribe();
    }

    this.styler = styler(this.ref.current, {});
    this.valueSubscribtion = this.pointValue.subscribe(this.styler.set);

    if (this.updateSubscription != null) {
      this.updateSubscription();
    }

    this.updateSubscription = autorun(this.style);
  }

  private style = () => {
    const { point } = this.props.placeCircle;

    this.pointValue!.update({ x: point.x, y: point.y });
    this.styler!.render();
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
    const { radius, strokeWidth, hover, visible, place, children } = placeCircle;

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
        <foreignObject transform={`translate(0, ${Math.round(radius + strokeWidth * 0.5 + 4)})`}>
          <PlaceCircleLabel label={place.name} clusterSize={children.length} />
        </foreignObject>
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
