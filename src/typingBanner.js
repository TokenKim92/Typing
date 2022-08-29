import Typing from './typing.js';
import FontFormat from '../lib/fontFormat.js';

export default class TypingBanner {
  #typing;
  #stageWidth;
  #stageHeight;
  #fontName;
  #fontColor;
  #backgroundColor;
  #isTyping = false;

  constructor(fontName, speed = 50, fontColor = '#ffffff', backgroundColor = '#000000cc') {
    this.#fontName = fontName;
    this.#fontColor = fontColor;
    this.#backgroundColor = backgroundColor;

    this.#typing = new Typing(
      new FontFormat(400, 50, this.#fontName, this.#fontColor),
      speed
    );
    this.#typing.hide();
    this.setMessage();
  } // prettier-ignore

  resize() {
    let borderRadius = 15;
    switch (this.#typing.sizeMode) {
      case Typing.LARGE_MODE:
      case Typing.MEDIUM_MODE:
        this.#stageWidth = 1300;
        this.#stageHeight = 500;
        this.#typing.fontFormat = new FontFormat(400, 50, this.#fontName, this.#fontColor); // prettier-ignore
        this.#typing.setStartPos(55, 130);
        break;
      case Typing.REGULAR_MODE:
        this.#stageWidth = 750;
        this.#stageHeight = 350;
        this.#typing.fontFormat = new FontFormat(400, 30, this.#fontName, this.#fontColor); // prettier-ignore
        this.#typing.setStartPos(20, 100);
        break;
      case Typing.SMALL_MODE:
        this.#stageWidth = 340;
        this.#stageHeight = 460;
        this.#typing.fontFormat = new FontFormat(400, 26, this.#fontName, this.#fontColor); // prettier-ignore
        this.#typing.setStartPos(20, 60);
        borderRadius = 10;
        break;
      default:
        throw new Error('This size mode is not valid.');
    }

    this.#typing.resize(this.#stageWidth, this.#stageHeight);
    this.#typing.setPosition(
      (document.body.clientWidth - this.#stageWidth) / 2,
      (document.body.clientHeight - this.#stageHeight) / 2
    );
    this.#typing.borderRadius = borderRadius;
    this.#typing.backgroundColor = this.#backgroundColor;
  }

  animate(curTime) {
    this.#typing.animate(curTime);
  }

  setMessage() {}

  show(millisecond = 0, mode = 'ease') {
    this.#isTyping = true;
    this.#typing.show(millisecond, mode);
  }

  hide(millisecond = 0, mode = 'ease') {
    this.#isTyping = false;
    this.#typing.hide(millisecond, mode);
    this.#typing.clearCanvas();
    setTimeout(() => this.#typing.init(), 300);
  }

  type(text, delayTime = 0) {
    this.#typing.type(text, delayTime);
    return this;
  }

  move(index, delayTime = 0) {
    this.#typing.move(index, delayTime);
    return this;
  }

  moveFront(delayTime = 0) {
    this.#typing.moveFront(delayTime);
    return this;
  }

  moveEnd(delayTime = 0) {
    this.#typing.moveEnd(delayTime);
    return this;
  }

  delete(count, delayTime = 0) {
    this.#typing.delete(count, delayTime);
    return this;
  }

  delay(time) {
    this.#typing.delay(time);
    return this;
  }

  start() {
    this.#typing.start();
  }

  get isMatchMedia() {
    return this.#typing.isMatchMedia;
  }

  get isTyping() {
    return this.#isTyping;
  }
}
