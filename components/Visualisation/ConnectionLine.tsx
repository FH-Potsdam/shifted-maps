import { Component, RefObject, createRef } from 'react';
import { observer } from 'mobx-react';
import { ValueReaction, value } from 'popmotion';
import styler, { Styler } from 'stylefire';
import { autorun, IReactionDisposer } from 'mobx';

import ConnectionLineModel from '../../store/ConnectionLine';
import styled from '../styled';

type Props = {
  connectionLine: ConnectionLineModel;
};

@observer
class ConnectionLine extends Component<Props> {
  private ref: RefObject<SVGLineElement>;
  private lineValue?: ValueReaction;
  private styler?: Styler;
  private updateSubscription?: IReactionDisposer;

  constructor(props: Props) {
    super(props);

    this.ref = createRef();
  }

  componentDidMount() {
    this.runStyler();
  }

  componentDidUpdate() {
    this.runStyler();
  }

  componentWillUnmount() {
    if (this.updateSubscription != null) {
      this.updateSubscription();
    }
  }

  private runStyler() {
    if (this.ref.current == null) {
      return;
    }

    this.styler = styler(this.ref.current, {});

    this.lineValue = value({ x1: 0, y1: 0, x2: 0, y2: 0, strokeWidth: 0 });
    this.lineValue.subscribe(this.styler.set);

    if (this.updateSubscription != null) {
      this.updateSubscription();
    }

    this.updateSubscription = autorun(this.style);
  }

  private style = () => {
    const { from, to, strokeWidth } = this.props.connectionLine;

    this.lineValue!.update({
      x1: from.point.x,
      y1: from.point.y,
      x2: to.point.x,
      y2: to.point.y,
      strokeWidth,
    });
    this.styler!.render();
  };

  render() {
    return (
      <g>
        <ConnectionLineLine innerRef={this.ref} />
      </g>
    );
  }
}

const ConnectionLineLine = styled.line`
  stroke: ${props => props.theme.foregroundColor};
`;

export default ConnectionLine;
