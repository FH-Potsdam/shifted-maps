import React, { Component } from 'react';
import ReactDom from 'react-dom';
import range from 'lodash/utility/range';
import { connect } from 'react-redux';
import d3 from 'd3';
import { vis } from '../selector';
import { hoverPlace } from '../actions/ui';
import PlaceCircleList from './place-circle-list';
import PlaceClipList from './place-clip-list';
import ConnectionList from './connection-list';
import PlaceList from './place-list';

class Vis extends Component {
  shouldComponentUpdate(nextProps) {
    return this.props.vis !== nextProps.vis ||
      this.props.nodes !== nextProps.nodes ||
      this.props.edges !== nextProps.edges;
  }

  onHover(placeId, hover) {
    let { dispatch } = this.props;

    dispatch(hoverPlace(placeId, hover));
  }

  componentDidMount() {
    this.update();
  }

  componentDidUpdate() {
    this.update();
  }

  update() {
    let element = d3.select(ReactDom.findDOMNode(this));

    element.selectAll('.place')
      .attr('transform', function() {
        let place = d3.select(this),
          x = place.attr('data-x'),
          y = place.attr('data-y');

        return `translate(${x}, ${y})`;
      });

    element.selectAll('.connection-line')
      .attr('x1', function() {
        return d3.select(this).attr('data-x1');
      })
      .attr('x2', function() {
        return d3.select(this).attr('data-x2');
      })
      .attr('y1', function() {
        return d3.select(this).attr('data-y1');
      })
      .attr('y2', function() {
        return d3.select(this).attr('data-y2');
      });
  }

  render() {
    let { vis, nodes, edges } = this.props;

    let {bounds, transform, zoom } = vis,
      boundSize = bounds.getSize();

    let { translate, scale } = transform.toJS();

    let viewBox = [bounds.min.x, bounds.min.y, boundSize.x, boundSize.y].join(' '),
      transformString = L.DomUtil.getTranslateString(translate),
      style = {};

    if (scale != null)
      transformString += ' scale(' + scale + ')';

    style[L.DomUtil.TRANSFORM] = transformString;

    let zoomRange = range(zoom).join(' ');

    return (
      <svg className={this.props.className} width={boundSize.x} height={boundSize.y} viewBox={viewBox} style={style} data-zoom={zoomRange}>
        <defs>
          <PlaceCircleList nodes={nodes} />
          <PlaceClipList nodes={nodes} />
        </defs>

        <ConnectionList edges={edges} />
        <PlaceList nodes={nodes} onHover={this.onHover.bind(this)} />
      </svg>
    );
  }
}

export default connect(vis)(Vis);