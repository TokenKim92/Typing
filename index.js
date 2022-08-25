import Typing from './src/typing.js';
import FontFormat from './lib/fontFormat.js';

window.onload = () => {
  const app = new AppBuilder()
    .fontName(new FontFormat(20, 50, 'Arial'))
    .speed(500)
    .build();

  app
    .type('the mot versti', 300)
    .move(-8, 100)
    .type('s', 400)
    .moveFront(300)
    .delete(1, 100)
    .type('T', 225)
    .move(12, 200)
    .type('a', 350)
    .moveEnd(150)
    .type('le typing utlity')
    .move(-4)
    .type('i')
    .move(4);
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
