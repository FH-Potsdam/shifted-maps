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
    let { image } = this.state,
      { node } = this.props;

    if (image == null)
      return null;

    let imageSize = image.width / (L.Browser.retina ? 2 : 1),
      nodeSize = Math.ceil(node.radius * 2);

    if (imageSize < nodeSize)
      imageSize = nodeSize;

    let src = image.src,
      radius = imageSize / 2;

    return <image key={src} x={-radius} y={-radius} width={imageSize} height={imageSize} xlinkHref={src} />;
  }

  render() {
    let { node } = this.props,
      { radius } = node,
      clipPath = 'url(#' + PlaceClip.createId(node) + ')',
      size = radius * 2,
      image = this.renderImage();

    let dot = null;

    if (!node.cluster)
      dot = <circle className="place-map-dot" r="3" cx="0" cy="0" />;

    return (
      <g className="place-map" clipPath={clipPath}>
        <rect className="place-map-background" x={-radius} y={-radius} width={size} height={size} />
        <ReactCSSTransitionGroup transitionName="fade" component="g"
                                 transitionEnterTimeout={400} transitionLeaveTimeout={400}>
          {image}
        </ReactCSSTransitionGroup>
        {dot}
      </g>
    );
  }
}

export default PlaceMap;