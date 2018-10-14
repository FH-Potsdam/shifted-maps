import { action, observable } from 'mobx';

class PlaceCircleMapImage {
  readonly href: string;
  readonly onLoad: () => void;

  @observable
  loaded = false;

  constructor(href: string, onLoad: () => void) {
    this.href = href;
    this.onLoad = onLoad;

    const image = new Image();
    image.src = href;
    image.onload = onLoad;
  }

  @action
  handleLoaded = () => {
    this.loaded = true;
    this.onLoad();
  };
}

export default PlaceCircleMapImage;
