import BaseCanvas from '../lib/baseCanvas.js';

export default class Typing extends BaseCanvas {
  static TAB_TOGGLE_TIME = 600;
  static TAB_THICKNESS = 2;
  static LINE_BREAK = -1;
  static BACK = -1;
  static FORWARD = 1;

  static INIT = 0;
  static TYPE = 1;
  static MOVE = 2;
  static DELETE = 3;

  #curMSG = { msg: Typing.INIT, data: null };
  #msgList = [];
  #fontFormat;
  #speed;
  #prevTimeForTab = 0;
  #prevMSGTime = 0;
  #tapToggle = true;
  #orgPosX = 0;
  #pos = {
    x: 0,
    y: 0,
  };
  #text;
  #charPosList = [];
  #curIndex = 0;
  #targetIndex = 0;
  #msgHandler = this.#tapping;
  #movingDirection = 0;

  constructor(fontFormat, speed = 100) {
    super(true);

    this.#fontFormat = fontFormat;
    this.#speed = speed;

    this.setStartPos(10, 10);
    this.#charPosList.push(this.#pos);
  }

  setStartPos(x, y) {
    this.#orgPosX = x;
    this.#pos = { x, y };
  }

  resize() {
    super.resize();

    this.ctx.textBaseline = 'top';
    this.ctx.font = this.#fontFormat.font;

    this.type(['hello', 'Hi']);
    this.move(-3);
  }

  animate(curTime) {
    if (this.#curMSG.msg === Typing.INIT) {
      this.#curMSG = this.#msgList.length !== 0 ? this.#msgList.shift() : this.#curMSG; //prettier-ignore
      this.#msgHandler = this.#initMsgHandle();
    }

    const isOnMSGTime = this.#speed < curTime - this.#prevMSGTime; //prettier-ignore
    if (isOnMSGTime) {
      const data = this.#curMSG.msg === Typing.INIT ? curTime : this.#curMSG.data; //prettier-ignore
      this.#msgHandler(data);
      this.#prevMSGTime = curTime;
    }
  }

  type(text) {
    this.#msgList.push({ msg: Typing.TYPE, data: text });
  }

  move(index) {
    this.#msgList.push({ msg: Typing.MOVE, data: index });
  }

  delete(count) {
    this.#msgList.push({ msg: Typing.DELETE, data: count });
  }

  #initMsgHandle() {
    switch (this.#curMSG.msg) {
      case Typing.TYPE:
        this.#setTypeData(this.#curMSG.data);
        return this.#typing;
      case Typing.MOVE:
        this.#setMoveData(this.#curMSG.data);
        return this.#moving;
      case Typing.DELETE:
        this.#setDeleteData(this.#curMSG.data);
        return this.#deleting;
      case Typing.INIT:
      default:
        return this.#tapping;
    }
  }

  #setTypeData(text) {
    if (text.constructor !== Array) {
      this.#text = text;
      this.#targetIndex = text.length;
      return;
    }

    let initText = '';
    text.forEach((textLine, index) => (initText += index !== text.length - 1 ? textLine + '\n' : textLine)); //prettier-ignore
    this.#text = initText;
    this.#targetIndex = initText.length;
  }

  #setMoveData(index) {
    this.#targetIndex += index;
    this.#movingDirection = this.#curMSG.data < 0 ? Typing.BACK : Typing.FORWARD; // prettier-ignore
  }

  #setDeleteData(count) {}

  #typing() {
    this.#clearTap();
    const character = this.#text[this.#curIndex++];
    if (character === '\n') {
      this.#lineBreak();
      this.#charPosList.push({ x: this.#pos.x, y: this.#pos.y });
      return;
    }

    this.ctx.fillText(character, this.#pos.x, this.#pos.y);
    const fontWidth = this.ctx.measureText(character).width;
    this.#pos.x += fontWidth;
    this.#charPosList.push({ x: this.#pos.x, y: this.#pos.y });
    this.#drawTap();

    this.#isLastCharacter && (this.#curMSG = { msg: Typing.INIT, data: null });
  }

  #moving(index) {
    this.#curIndex += this.#movingDirection;
    if (this.#curIndex < 0) {
      this.#curIndex = 0;
    } else if (this.#curIndex > this.#textLength - 1) {
      this.#curIndex = this.#textLength - 1;
    }

    this.#clearTap();
    this.#pos = this.#charPosList[this.#curIndex];
    this.#drawTap();

    this.#isLastCharacter && (this.#curMSG = { msg: Typing.INIT, data: null });
  }

  #deleting() {}

  #tapping(curTime) {
    const isOnTapToggleTime = Typing.TAB_TOGGLE_TIME < curTime - this.#prevTimeForTab; //prettier-ignore
    if (isOnTapToggleTime) {
      if (this.#isLastCharacter) {
        this.#tapToggle ? this.#drawTap() : this.#clearTap();
        this.#tapToggle = !this.#tapToggle;
      }
      this.#prevTimeForTab = curTime;
    }
  }

  #lineBreak() {
    this.#pos.x = this.#orgPosX;
    this.#pos.y += this.#fontFormat.size;
  }

  #drawTap() {
    this.ctx.save();
    this.ctx.imageSmoothingEnabled = false;
    this.ctx.fillStyle = '#000000';
    this.ctx.fillRect(
      this.#pos.x,
      this.#pos.y,
      Typing.TAB_THICKNESS,
      this.#fontFormat.size
    );
    this.ctx.restore();
  }

  #clearTap() {
    this.ctx.clearRect(
      this.#pos.x - 1,
      this.#pos.y,
      Typing.TAB_THICKNESS + 2,
      this.#fontFormat.size
    );
  }

  get #textLength() {
    return this.#text ? this.#text.length : 0;
  }

  get #isLastCharacter() {
    return this.#curIndex === this.#targetIndex;
  }
}
