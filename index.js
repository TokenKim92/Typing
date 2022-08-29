import IntroductionBanner from './src/introductionBanner.js';

WebFont.load({
  google: { families: ['Fjalla One'] },
  fontactive: () => {
    const app = new AppBuilder().fontName('Fjalla One').speed(30).build();
  },
});

class AppBuilder {
  #app;
  #font;
  #speed;

  fontName(font) {
    this.#font = font;
    return this;
  }

  speed(speed) {
    this.#speed = speed;
    return this;
  }

  build() {
    this.#app = new IntroductionBanner(this.#font, this.#speed);
    window.addEventListener('resize', this.resize);
    window.requestAnimationFrame(this.#animate);
    this.#app.show();
    this.resize();

    return this.#app;
  }

  resize = () => {
    this.#app.resize();
  };

  #animate = (curTime) => {
    window.requestAnimationFrame(this.#animate);
    this.#app.animate(curTime);
  };
}
