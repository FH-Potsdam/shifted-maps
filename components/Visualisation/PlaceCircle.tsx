import { Component, SyntheticEvent, RefObject, createRef } from 'react';
import { observer } from 'mobx-react';
import { action, IReactionDisposer, autorun } from 'mobx';

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
  private _ref: RefObject<SVGGElement>;
  private _styleDisposer?: IReactionDisposer;

  constructor(props: Props) {
    super(props);

    this._ref = createRef();
  }

  componentDidMount() {
    this._styleDisposer = autorun(this.style);
  }

  componentWillUnmount() {
    if (this._styleDisposer != null) {
      this._styleDisposer();
    }
  }

  private style = () => {
    const { point } = this.props.placeCircle;
    const group = this._ref.current!;

    group.setAttribute('transform', `translate(${point.x}, ${point.y})`);
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
    const { radius, strokeWidth, hover, place, children } = placeCircle;

    return (
      <g
        ref={this._ref}
        onMouseEnter={this.handleMouseEnter}
        onMouseLeave={this.handleMouseLeave}
        className={className}
      >
        <PlaceCircleBackground r={radius} />
        <PlaceCircleMap placeCircle={placeCircle} />
        <PlaceCircleStroke r={radius} style={{ strokeWidth: `${strokeWidth}px` }} hover={hover} />
        <PlaceCircleLabel
          label={place.name}
          clusterSize={children.length}
          offset={strokeWidth * 0.5 + 4 + radius}
          hover={hover}
        />
      </g>
    );
  }
}

export default styled(PlaceCircle)`
  pointer-events: auto;
  display: ${props => (props.placeCircle.visible ? 'block' : 'none')};

  .leaflet-dragging & {
    cursor: move;
    cursor: grabbing;
  }
`;
