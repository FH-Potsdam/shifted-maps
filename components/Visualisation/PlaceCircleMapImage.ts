import { action, observable } from 'mobx';

class PlaceCircleMapImage {
  readonly href: string;

  @observable
  loaded = false;

  constructor(href: string) {
    this.href = href;

    const image = new Image();
    image.src = href;
    image.onload = this.handleLoaded;
  }

  @action
  handleLoaded = () => {
    this.loaded = true;
  };
}

export default PlaceCircleMapImage;
