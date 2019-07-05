declare global {
  // tslint:disable-next-line interface-name
  interface Document {
    fonts?: {
      check(font: string, label?: string): boolean;
      load(font: string, label?: string): Promise<any>;
    };
  }
}

function preloadFont(font: string, label?: string) {
  if (document.fonts == null || document.fonts.check(font, label)) {
    return Promise.resolve();
  }

  return document.fonts.load(font, label);
}

export default preloadFont;
