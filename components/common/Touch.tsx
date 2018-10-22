import { action, observable } from 'mobx';
import { observer } from 'mobx-react';
import { Component, ReactNode } from 'react';

interface IProps {
  children: (touch: boolean) => ReactNode;
}

@observer
class Touch extends Component<IProps> {
  private detectingTouch: boolean = false;

  @observable
  private touch: boolean = true;

  componentDidMount() {
    window.addEventListener('resize', this.handleResize);

    this.addTouchDetection();
  }

  componentWillUnmount() {
    this.removeTouchDetection();
  }

  render() {
    return this.props.children(this.touch);
  }

  private addTouchDetection() {
    if (this.detectingTouch) {
      return;
    }

    window.addEventListener('touchstart', this.handleTouchStart);
    window.addEventListener('mousemove', this.handleMouseMove);

    this.detectingTouch = true;
  }

  private removeTouchDetection() {
    if (!this.detectingTouch) {
      return;
    }

    window.removeEventListener('touchstart', this.handleTouchStart);
    window.removeEventListener('mousemove', this.handleMouseMove);

    this.detectingTouch = false;
  }

  private handleResize = () => {
    this.addTouchDetection();
  };

  @action
  private handleTouchStart = () => {
    this.touch = true;

    this.removeTouchDetection();
  };

  @action
  private handleMouseMove = () => {
    this.touch = false;

    this.removeTouchDetection();
  };
}

export default Touch;
