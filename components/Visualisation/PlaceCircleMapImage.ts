import { action, makeObservable, observable } from 'mobx';

class PlaceCircleMapImage {
  readonly href: string;

  loaded = false;

  constructor(href: string) {
    makeObservable(this, {
      loaded: observable,
      handleLoaded: action,
    });

    this.href = href;

    const image = new Image();
    image.src = href;
    image.onload = this.handleLoaded;
  }

  handleLoaded = () => {
    this.loaded = true;
  };
}

export default PlaceCircleMapImage;
