import React, { Component } from 'react';
import ReactCSSTransitionGroup from 'react-addons-css-transition-group';
import PlaceClip from './place-clip';

const EMPTY_IMAGE_URL = 'data:image/gif;base64,R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs=';

class PlaceMap extends Component {
  constructor(props) {
    super(props);

    this.image = null;

    this.state = {
      image: null
    };
  }

  shouldComponentUpdate(nextProps, nextState) {
    let { node } = this.props,
      nextNode = nextProps.node;

    return node.radius !== nextNode.radius ||
      node.tileURL !== nextNode.tileURL ||
      this.state.image !== nextState.image;
  }

  componentWillMount() {
    this.updateImage(this.props);
  }

  componentWillReceiveProps(nextProps) {
    this.updateImage(nextProps);
  }

  updateImage(nextProps) {
    let { tileURL } = nextProps.node;

    if (tileURL == null || this.state.url === tileURL)
      return;

    this.abortImage();

    let image = this.image = new Image();

    image.onload = () => {
      this.image = null;

      this.setState({ image });
    };

    image.src = tileURL;
  }

  abortImage() {
    let image = this.image;

    if (image == null)
      return;

    image.onload = function() { return false };
    image.src = EMPTY_IMAGE_URL;

    this.image = null;
  }

  renderImage() {
    let { image } = this.state;

    if (image == null)
      return null;

    let src = image.src,
      size = image.width / (L.Browser.retina ? 2 : 1),
      radius = size / 2;

    return <image key={src} x={-radius} y={-radius} width={size} height={size} xlinkHref={src} />;
  }

  render() {
    let { node } = this.props,
      { radius } = node,
      clipPath = 'url(#' + PlaceClip.createId(node) + ')',
      size = radius * 2,
      image = this.renderImage();

    return (
      <g className="place-map" clipPath={clipPath}>
        <rect className="place-map-background" x={-radius} y={-radius} width={size} height={size} />
        <ReactCSSTransitionGroup transitionName="fade" component="g"
                                 transitionEnterTimeout={400} transitionLeaveTimeout={400}>
          {image}
        </ReactCSSTransitionGroup>
        <circle className="place-map-dot" r="3" cx="0" cy="0" />
      </g>
    );
  }
}

export default PlaceMap;