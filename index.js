import Typing from './src/typing.js';
import FontFormat from './lib/fontFormat.js';

window.onload = () => {
  new AppBuilder().fontName(new FontFormat(50, 50, 'Arial')).speed(500).build();
};

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
    this.#app = new Typing(this.#font);
    window.addEventListener('resize', this.resize);
    window.requestAnimationFrame(this.#animate);
    this.#app.resize();

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
