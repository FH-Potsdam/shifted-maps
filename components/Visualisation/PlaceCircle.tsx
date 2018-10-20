import classNames from 'classnames';
import debounce from 'lodash/fp/debounce';
import { action, autorun, IReactionDisposer, observable } from 'mobx';
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

const PlaceCircleStroke = styled.circle`
  transition: stroke ${props => props.theme.shortTransitionDuration};
  fill: none;
  stroke: ${props => props.theme.foregroundColor};

  &.highlight {
    stroke: ${props => props.theme.highlightColor};
  }
`;

interface IProps {
  placeCircle: PlaceCircleModel;
  className?: string;
}

@observer
class PlaceCircle extends Component<IProps> {
  private readonly ref: RefObject<SVGGElement>;

  private styleDisposer?: IReactionDisposer;

  private toggle = debounce(50)(
    action((hover: boolean) => {
      this.props.placeCircle.hover = hover;
    })
  );

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
    const { radius, strokeWidth, hover, place, children, visible, fade } = placeCircle;

    return (
      <g
        ref={this.ref}
        onMouseEnter={this.handleMouseEnter}
        onMouseLeave={this.handleMouseLeave}
        className={classNames(className, { visible, fade })}
      >
        <PlaceCircleBackground r={radius} />
        <PlaceCircleMap placeCircle={placeCircle} />
        <PlaceCircleStroke
          r={radius}
          style={{ strokeWidth: `${strokeWidth}px` }}
          className={classNames({ highlight: hover })}
        />
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

  private handleMouseEnter = (event: SyntheticEvent) => {
    event.stopPropagation();

    this.toggle(true);
  };

  private handleMouseLeave = (event: SyntheticEvent) => {
    event.stopPropagation();

    this.toggle(false);
  };
}

export default styled(PlaceCircle)`
  will-change: transform, opacity;
  pointer-events: auto;
  transition: opacity ${props => props.theme.transitionDuration};
  display: none;
  opacity: 1;

  &.visible {
    display: block;
  }

  &.fade {
    opacity: 0.2;
  }

  .leaflet-dragging & {
    cursor: move;
    cursor: grabbing;
  }
`;
