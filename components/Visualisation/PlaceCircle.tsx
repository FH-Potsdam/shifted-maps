import { action, autorun, IReactionDisposer } from 'mobx';
import { observer } from 'mobx-react';
import { Component, createRef, RefObject, SyntheticEvent } from 'react';

import PlaceCircleModel from '../../stores/PlaceCircle';
import styled from '../styled';
import PlaceCircleLabel from './PlaceCircleLabel';
import PlaceCircleMap from './PlaceCircleMap';

const PlaceCircleBackground = styled.circle`
  fill: ${props => props.theme.backgroundColor};
  stroke: none;
`;

const PlaceCircleStroke = styled.circle<{ hover: boolean }>`
  transition: stroke ${props => props.theme.shortTransitionDuration};
  fill: none;
  stroke: ${props => (props.hover ? props.theme.highlightColor : props.theme.foregroundColor)};
`;

interface IProps {
  placeCircle: PlaceCircleModel;
  className?: string;
}

@observer
class PlaceCircle extends Component<IProps> {
  private ref: RefObject<SVGGElement>;
  private styleDisposer?: IReactionDisposer;

  constructor(props: IProps) {
    super(props);

    this.ref = createRef();
  }

  componentDidMount() {
    this.styleDisposer = autorun(this.style);
  }

  componentWillUnmount() {
    if (this.styleDisposer != null) {
      this.styleDisposer();
    }
  }

  render() {
    const { placeCircle, className } = this.props;
    const { radius, strokeWidth, hover, place, children } = placeCircle;

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
        <PlaceCircleLabel
          label={place.name}
          clusterSize={children.length}
          offset={strokeWidth * 0.5 + 4 + radius}
          hover={hover}
        />
      </g>
    );
  }

  private style = () => {
    const { point } = this.props.placeCircle;
    const group = this.ref.current!;

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
}

export default styled(PlaceCircle)`
  pointer-events: auto;
  display: ${props => (props.placeCircle.visible ? 'block' : 'none')};

  .leaflet-dragging & {
    cursor: move;
    cursor: grabbing;
  }
`;
