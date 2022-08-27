import Typing from './src/typing.js';
import FontFormat from './lib/fontFormat.js';

WebFont.load({
  google: { families: ['Fjalla One'] },
  fontactive: () => {
    const app = new AppBuilder()
      .fontName(new FontFormat(400, 50, 'Fjalla One', 'white'))
      .speed(500)
      .build();

    let noteWidth = 1300;
    let noteHeight = 500;
    let borderRadius = 15;
    let isMobileMode = false;

    switch (app.sizeMode) {
      case Typing.LARGE_MODE:
      case Typing.MEDIUM_MODE:
        noteWidth = 1300;
        noteHeight = 500;
        app.resize(noteWidth, noteHeight);
        app.setStartPos(55, 130);
        break;
      case Typing.REGULAR_MODE:
        noteWidth = 750;
        noteHeight = 350;
        app.fontFormat = new FontFormat(400, 30, 'Fjalla One', 'white');
        app.resize(noteWidth, noteHeight);
        app.setStartPos(20, 100);
        break;
      case Typing.SMALL_MODE:
        noteWidth = 340;
        noteHeight = 460;
        app.fontFormat = new FontFormat(400, 26, 'Fjalla One', 'white');
        app.resize(noteWidth, noteHeight);
        app.setStartPos(20, 60);
        borderRadius = 10;
        isMobileMode = true;
        break;
      default:
        throw new Error('This size mode is not valid.');
    }

    app.setPosition(
      (document.body.clientWidth - noteWidth) / 2,
      (document.body.clientHeight - noteHeight) / 2
    );
    app.borderRadius = borderRadius;
    app.backgroundColor = '#000000aa';
    app.hide();
    app.show(1000);

    if (!isMobileMode) {
      app
        .delay(2500)
        .type('Hi', 200)
        .move(-1, 100)
        .delete(1, 100)
        .type('ello,', 200)
        .type(' I am Token Kim.', 200)
        .move(-10, 100)
        .delete(5, 100)
        .type('Deokgeun', 100)
        .moveEnd(200)
        .type(['', 'A Software Engineer of C/C++'], 200)
        .move(-8, 100)
        .delete(8, 10)
        .type('currently residing in Germany.', 200)
        .move(-8, 100)
        .type('Dresden, ', 200)
        .moveEnd(200)
        .type(['', "It's my portfolio of HTML5"], 200)
        .move(-5, 100)
        .type('interactive ', 200)
        .moveEnd(1500)
        .type(' without library.', 300)
        .type(['', 'Please enjoy this.'], 50)
        .start();
    } else {
      app
        .delay(2500)
        .type('Hi', 200)
        .move(-1, 100)
        .delete(1, 100)
        .type('ello,', 200)
        .type(' I am Token Kim.', 200)
        .move(-10, 100)
        .delete(5, 100)
        .type('Deokgeun', 100)
        .moveEnd(200)
        .type(['', '', 'A Software Engineer of C/C++'], 200)
        .move(-8, 100)
        .delete(8, 10)
        .type(['', 'currently residing in', 'Germany.'], 200)
        .move(-8, 100)
        .type('Dresden, ', 200)
        .moveEnd(200)
        .type(['', '', "It's my portfolio of HTML5"], 200)
        .move(-5, 100)
        .delete(5)
        .type('interactive')
        .moveEnd()
        .type(['', 'HTML5'], 1500)
        .type(' without library.', 300)
        .type(['', '', 'Please enjoy this.'], 50)
        .start();
    }
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
