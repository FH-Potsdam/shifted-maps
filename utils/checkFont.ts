function preloadFont(font: string, label?: string) {
  if (document.fonts.check(font, label)) {
    return Promise.resolve();
  }

  return document.fonts.load(font, label);
}

export default preloadFont;
