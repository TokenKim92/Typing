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
  #orgPos = {
    x: 0,
    y: 0,
  };
  #tabPos = {
    x: 0,
    y: 0,
  };
  #text = '';
  #charPosList = [];
  #curIndex = 0;
  #targetIndex = 0;
  #msgHandler = this.#tapping;
  #movingDirection = 0;
  #isTabAtEnd = true;
  #tailText;

  constructor(fontFormat, speed = 100) {
    super(true);

    this.#fontFormat = fontFormat;
    this.#speed = speed;

    this.setStartPos(10, 10);
    this.#charPosList.push(this.#tabPos);
  }

  setStartPos(x, y) {
    this.#orgPos = { x, y };
    this.#tabPos = { x, y };
  }

  resize() {
    super.resize();

    this.ctx.textBaseline = 'top';
    this.ctx.font = this.#fontFormat.font;

    this.type(['This is a great string.', 'But here is a better one.']);
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
    const toBeAddedText =
      text.constructor !== Array
        ? text
        : text.reduce((totalText, textLine, index) => (totalText += index !== text.length - 1 ? textLine + '\n' : textLine), ''); // prettier-ignore

    const headText = this.#text.slice(0, this.#curIndex);
    this.#tailText = this.#text.slice(this.#curIndex);
    this.#text = headText + toBeAddedText + this.#tailText;
    this.#targetIndex = this.#curIndex + toBeAddedText.length;

    const index = this.#tailText.indexOf('\n');
    index === -1 || (this.#tailText = this.#tailText.slice(0, index));

    this.#initCharPosList();
  }

  #initCharPosList() {
    this.#charPosList = [];
    let pos = { ...this.#orgPos };
    this.#charPosList.push({ ...pos });

    for (let i = 0; i < this.#text.length; i++) {
      const character = this.#text[i];
      pos = character === '\n'
              ? this.#calculateNewLinePos(pos)
              : { x: (pos.x += this.ctx.measureText(character).width), y: pos.y }; // prettier-ignore
      this.#charPosList.push({ ...pos });
    }
  }

  #calculateNewLinePos(pos) {
    return { x: this.#orgPos.x, y: pos.y + this.#fontFormat.size };
  }

  #setMoveData(index) {
    this.#targetIndex += index;
    this.#movingDirection = this.#curMSG.data < 0 ? Typing.BACK : Typing.FORWARD; // prettier-ignore

    // TODO :: set again if tab is at the end
    this.#isTabAtEnd = false;
  }

  #setDeleteData(count) {}

  #typing() {
    const pos = this.#charPosList[this.#curIndex];
    this.#clearTap(pos);
    this.#isTabAtEnd || this.#clearTailText();

    const character = this.#text[this.#curIndex];
    const text = this.#isTabAtEnd ? character : character + this.#tailText;

    this.ctx.fillText(text, pos.x, pos.y);

    const nextPos = this.#charPosList[this.#curIndex + 1];
    this.#drawTap(nextPos);

    this.#curIndex++;
    this.#isLastCharacter && (this.#curMSG = { msg: Typing.INIT, data: null });
  }

  #moving(index) {
    const pos = this.#charPosList[this.#curIndex];
    this.#clearTap(pos);

    this.#curIndex += this.#movingDirection;
    // if (this.#curIndex < 0) {
    //   this.#curIndex = 0;
    // } else if (this.#curIndex > this.#textLength) {
    //   this.#curIndex = this.#textLength;
    // }

    const nextPos = this.#charPosList[this.#curIndex];
    this.#drawTap(nextPos);
    console.log(this.#movingDirection, this.#curIndex, this.#targetIndex);
    this.#isLastCharacter && (this.#curMSG = { msg: Typing.INIT, data: null });
  }

  #deleting() {}

  #tapping(curTime) {
    const isOnTapToggleTime = Typing.TAB_TOGGLE_TIME < curTime - this.#prevTimeForTab; //prettier-ignore
    if (isOnTapToggleTime) {
      if (this.#isLastCharacter) {
        const pos = this.#charPosList[this.#curIndex];
        this.#tapToggle ? this.#drawTap(pos) : this.#clearTap(pos);
        this.#tapToggle = !this.#tapToggle;
      }
      this.#prevTimeForTab = curTime;
    }
  }

  #drawTap(pos) {
    this.ctx.save();
    this.ctx.imageSmoothingEnabled = false;
    this.ctx.fillStyle = '#000000';
    this.ctx.fillRect(
      pos.x,
      pos.y,
      Typing.TAB_THICKNESS,
      this.#fontFormat.size
    );
    this.ctx.restore();
  }

  #clearTap(pos) {
    this.ctx.clearRect(
      pos.x - 1,
      pos.y,
      Typing.TAB_THICKNESS + 2,
      this.#fontFormat.size
    );
  }

  #clearTailText() {
    const startPos = this.#charPosList[this.#curIndex];
    const endPos = this.#charPosList[this.#lastIndexInLine];

    this.clearRect(
      startPos.x,
      startPos.y,
      endPos.x,
      endPos.y + this.#fontFormat.size
    );
  }

  get #lastIndexInLine() {
    let i;
    for (i = this.#targetIndex; i < this.#text.length; i++) {
      if (this.#text[i] === '\n') {
        break;
      }
    }
    i === this.#charPosList.length && i--;
    return i;
  }

  get #isLastCharacter() {
    return this.#curIndex === this.#targetIndex;
  }
}
