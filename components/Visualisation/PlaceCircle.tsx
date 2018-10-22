import classNames from 'classnames';
import debounce from 'lodash/fp/debounce';
import { autorun, IReactionDisposer } from 'mobx';
import { observer } from 'mobx-react';
import { Component, createRef, MouseEvent, RefObject } from 'react';

import PlaceCircleModel from '../../stores/PlaceCircle';
import VisualisationStore from '../../stores/VisualisationStore';
import styled from '../styled';
import PlaceCircleLabel from './PlaceCircleLabel';
import PlaceCircleMap from './PlaceCircleMap';

interface IProps {
  placeCircle: PlaceCircleModel;
  vis: VisualisationStore;
  className?: string;
  touch: boolean;
}

@observer
class PlaceCircle extends Component<IProps> {
  private readonly ref: RefObject<SVGGElement>;

  private styleDisposer?: IReactionDisposer;

  private toggle = debounce(50)((active?: boolean) => {
    const { placeCircle, vis } = this.props;

    vis.toggle(placeCircle, active);
  });

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

    this.toggle.cancel();
  }

  render() {
    const { placeCircle, className, vis, touch } = this.props;
    const { radius, strokeWidth, active, visible, fade } = placeCircle;

    const toggleListeners = !touch
      ? {
          onMouseEnter: this.handleMouseEnter,
          onMouseLeave: this.handleMouseLeave,
        }
      : {
          onClick: this.handleClick,
        };

    return (
      <g ref={this.ref} className={classNames(className, { visible, fade })} {...toggleListeners}>
        <PlaceCircleBackground r={radius} />
        <PlaceCircleMap placeCircle={placeCircle} vis={vis} />
        <PlaceCircleStroke
          r={radius}
          style={{ strokeWidth: `${strokeWidth}px` }}
          className={classNames({ highlight: active })}
        />
        <PlaceCircleLabel placeCircle={placeCircle} />
      </g>
    );
  }

  private style = () => {
    const { point } = this.props.placeCircle;
    const group = this.ref.current!;

    group.setAttribute('transform', `translate(${point.x}, ${point.y})`);
  };

  private handleMouseEnter = () => {
    this.toggle(true);
  };

  private handleMouseLeave = () => {
    this.toggle(false);
  };

  private handleClick = (event: MouseEvent<SVGGElement>) => {
    event.stopPropagation();

    this.toggle();
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
