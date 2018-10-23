import classNames from 'classnames';
import { action, autorun, IReactionDisposer, observable } from 'mobx';
import { observer } from 'mobx-react';
import { Component, MouseEvent } from 'react';

import PlaceCircleModel from '../../stores/PlaceCircle';
import VisualisationStore from '../../stores/VisualisationStore';
import styled from '../styled';
import PlaceCircleLabel from './PlaceCircleLabel';
import PlaceCircleMap from './PlaceCircleMap';
import { DEVICE } from './Visualisation';

interface IProps {
  placeCircle: PlaceCircleModel;
  vis: VisualisationStore;
  className?: string;
  touch: boolean;
  device: DEVICE;
}

@observer
class PlaceCircle extends Component<IProps> {
  private styleDisposer?: IReactionDisposer;

  @observable.ref
  private ref: SVGGElement | null = null;

  componentDidMount() {
    this.styleDisposer = autorun(this.style);
  }

  componentWillUnmount() {
    if (this.styleDisposer != null) {
      this.styleDisposer();
    }
  }

  render() {
    const { placeCircle, className, vis, touch, device } = this.props;
    const { radius, strokeWidth, active, visible, fade } = placeCircle;

    if (!visible) {
      return null;
    }

    const toggleListeners = !touch
      ? {
          onMouseEnter: this.handleMouseEnter,
          onMouseLeave: this.handleMouseLeave,
        }
      : {
          onClick: this.handleClick,
        };

    return (
      <g ref={this.updateRef} className={classNames(className, { fade })} {...toggleListeners}>
        <PlaceCircleBackground r={radius} />
        <PlaceCircleMap placeCircle={placeCircle} vis={vis} />
        <PlaceCircleStroke
          r={radius}
          style={{ strokeWidth: `${strokeWidth}px` }}
          className={classNames({ highlight: active })}
        />
        <PlaceCircleLabel placeCircle={placeCircle} device={device} />
      </g>
    );
  }

  @action
  private updateRef = (ref: SVGGElement | null) => {
    this.ref = ref;
  };

  private style = () => {
    if (this.ref == null) {
      return;
    }

    const { point } = this.props.placeCircle;

    this.ref.setAttribute('transform', `translate(${point.x}, ${point.y})`);
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

  private toggle(active?: boolean) {
    const { placeCircle, vis } = this.props;

    vis.toggle(placeCircle, active);
  }
}

export default styled(PlaceCircle)`
  will-change: transform, opacity;
  pointer-events: auto;
  transition: opacity ${props => props.theme.transitionDuration};
  opacity: 1;

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
