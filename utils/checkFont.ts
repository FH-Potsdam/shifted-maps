declare global {
  // tslint:disable-next-line interface-name
  interface Document {
    fonts?: {
      check(font: string, label?: string): boolean;
      load(font: string, label?: string): Promise<any>;
    };
  }
}

function preloadFont(font: string, label: string, callback: () => void) {
  if (document.fonts != null && !document.fonts.check(font, label)) {
    document.fonts.load(font, label).then(callback);
  }
}

export default preloadFont;
