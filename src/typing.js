import BaseCanvas from '../lib/baseCanvas.js';

export default class Typing extends BaseCanvas {
  static TAB_TOGGLE_TIME = 600;
  static TAB_THICKNESS = 1;
  static LINE_BREAK = -1;
  static BACK = -1;
  static FORWARD = 1;

  static INIT = 0;
  static TYPE = 1;
  static MOVE = 2;
  static DELETE = 3;
  static DELAY = 4;

  #curMSG = { msg: Typing.INIT, data: null };
  #msgList = [];
  #fontFormat;
  #speed;
  #curTime = 0;
  #prevWaitingTime = 0;
  #prevMSGTime = 0;
  #tapToggle = true;
  #orgPos = {
    x: 0,
    y: 0,
  };
  #text = '';
  #charPosList = [];
  #curIndex = 0;
  #targetIndex = 0;
  #msgHandler = this.#tabToggling;
  #movingDirection = 0;
  #isTabAtEnd = true;
  #tailText;
  #delayTime;

  constructor(fontFormat, speed = 50) {
    super(true);

    this.#fontFormat = fontFormat;
    this.#speed = speed;

    this.setStartPos(10, 10);
  }

  setStartPos(x, y) {
    this.#orgPos = { x, y };
  }

  resize() {
    super.resize();

    this.ctx.textBaseline = 'top';
    this.ctx.font = this.#fontFormat.font;
  }

  animate(curTime) {
    this.#curTime = curTime;

    if (this.#curMSG.msg === Typing.INIT) {
      this.#curMSG = this.#msgList.length !== 0 ? this.#msgList.shift() : this.#curMSG; //prettier-ignore
      this.#msgHandler = this.#initMsgHandle();
    }

    if (this.#isProcessMessage && this.#isMessageProcessTime) {
      this.#msgHandler(this.#curMSG.data);
      this.#prevMSGTime = curTime;

      return;
    }

    if (this.#isWaitingTime) {
      this.#tabToggling();
      this.#prevWaitingTime = this.#curTime;

      if (this.#isDelayMessage && this.#isDoneDelay) {
        this.#curMSG = { msg: Typing.INIT, data: null };
      }
    }
  }

  type(text, delayTime = 0) {
    this.#msgList.push({ msg: Typing.TYPE, data: text });
    !!delayTime && this.#msgList.push({ msg: Typing.DELAY, data: delayTime }); // prettier-ignore
    return this;
  }

  move(index, delayTime = 0) {
    this.#msgList.push({ msg: Typing.MOVE, data: index });
    !!delayTime && this.#msgList.push({ msg: Typing.DELAY, data: delayTime }); // prettier-ignore
    return this;
  }

  moveFront(delayTime = 0) {
    this.#msgList.push({ msg: Typing.MOVE, data: Number.MIN_SAFE_INTEGER });
    !!delayTime && this.#msgList.push({ msg: Typing.DELAY, data: delayTime }); // prettier-ignore
    return this;
  }

  moveEnd(delayTime = 0) {
    this.#msgList.push({ msg: Typing.MOVE, data: Number.MAX_SAFE_INTEGER });
    !!delayTime && this.#msgList.push({ msg: Typing.DELAY, data: delayTime }); // prettier-ignore
    return this;
  }

  delete(count, delayTime = 0) {
    this.#msgList.push({ msg: Typing.DELETE, data: count });
    !!delayTime && this.#msgList.push({ msg: Typing.DELAY, data: delayTime }); // prettier-ignore
    return this;
  }

  delay(time) {
    this.#msgList.push({ msg: Typing.DELAY, data: time });
    return this;
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
      case Typing.DELAY:
        this.#setDelayData(this.#curMSG.data);
      case Typing.INIT:
      default:
        return this.#tabToggling;
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

    //TODO:: find right index
    this.#initCharPosList(0);
  }

  #initCharPosList(startIndex) {
    this.#charPosList.splice(startIndex, this.#charPosList.length - startIndex);

    let pos =
      startIndex === 0
        ? { ...this.#orgPos }
        : { ...this.#charPosList[startIndex - 1] };
    this.#charPosList.push({ ...pos });

    for (let i = startIndex; i < this.#text.length; i++) {
      const character = this.#text[i];
      pos = character === '\n'
              ? this.#calculateNewLinePos(pos)
              : { 
                  x: pos.x += this.ctx.measureText(character).width, 
                  y: pos.y 
                }; // prettier-ignore
      this.#charPosList.push({ ...pos });
    }
  }

  #calculateNewLinePos(pos) {
    return { x: this.#orgPos.x, y: pos.y + this.#fontFormat.size };
  }

  #setMoveData(index) {
    this.#targetIndex += index;
    this.#targetIndex > this.#text.length && (this.#targetIndex = this.#text.length); // prettier-ignore
    this.#targetIndex < 0 && (this.#targetIndex = 0);

    this.#movingDirection = this.#curMSG.data < 0 ? Typing.BACK : Typing.FORWARD; // prettier-ignore
    // TODO :: set again if tab is at the end
    this.#isTabAtEnd = false;
  }

  #setDeleteData(count) {
    this.#targetIndex += count;
    this.#targetIndex > this.#text.length && (this.#targetIndex = this.#text.length); // prettier-ignore

    this.#movingDirection = this.#curMSG.data < 0 ? Typing.BACK : Typing.FORWARD; // prettier-ignore
  }

  #setDelayData(time) {
    this.#delayTime = this.#curTime + time;
  }

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
    this.#isProcessDone && (this.#curMSG = { msg: Typing.INIT, data: null });
  }

  #moving() {
    const pos = this.#charPosList[this.#curIndex];
    this.#clearTap(pos);

    this.#curIndex += this.#movingDirection;
    const nextPos = this.#charPosList[this.#curIndex];
    this.#drawTap(nextPos);

    this.#isProcessDone && (this.#curMSG = { msg: Typing.INIT, data: null });
  }

  #deleting() {
    const pos = this.#charPosList[this.#curIndex];
    this.#clearTap(pos);
    this.#clearTailText();

    this.#tailText = this.#text.slice(this.#curIndex + 1);
    this.#text = this.#text.slice(0, this.#curIndex) + this.#tailText;

    this.#initCharPosList(this.#curIndex + 1);

    this.ctx.fillText(this.#tailText, pos.x, pos.y);

    this.#targetIndex -= this.#movingDirection;
    const nextPos = this.#charPosList[this.#curIndex];
    this.#drawTap(nextPos);

    this.#isProcessDone && (this.#curMSG = { msg: Typing.INIT, data: null });
  }

  #tabToggling() {
    const pos = this.#charPosList[this.#curIndex];
    this.#tapToggle ? this.#drawTap(pos) : this.#clearTap(pos);
    this.#tapToggle = !this.#tapToggle;
  }

  #drawTap(pos) {
    this.ctx.save();
    this.ctx.imageSmoothingEnabled = false;
    this.ctx.fillStyle = '#000000';
    this.ctx.fillRect(pos.x, pos.y, Typing.TAB_THICKNESS, this.#fontFormat.size); //prettier-ignore
    this.ctx.restore();
  }

  #clearTap(pos) {
    this.ctx.clearRect(pos.x - 1, pos.y, Typing.TAB_THICKNESS + 2, this.#fontFormat.size); //prettier-ignore
  }

  #clearTailText() {
    const startPos = this.#charPosList[this.#curIndex];
    const endPos = this.#charPosList[this.#lastIndexInLine];

    this.clearRect(startPos.x, startPos.y, endPos.x, endPos.y + this.#fontFormat.size); //prettier-ignore
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

  get #isProcessDone() {
    return this.#curIndex === this.#targetIndex;
  }

  get #isMessageProcessTime() {
    return this.#speed < this.#curTime - this.#prevMSGTime;
  }

  get #isWaitingTime() {
    return Typing.TAB_TOGGLE_TIME < this.#curTime - this.#prevWaitingTime;
  }

  get #isProcessMessage() {
    return this.#curMSG.msg !== Typing.INIT && this.#curMSG.msg !== Typing.DELAY; // prettier-ignore
  }

  get #isDelayMessage() {
    return this.#curMSG.msg === Typing.DELAY;
  }

  get #isDoneDelay() {
    return this.#delayTime < this.#curTime;
  }
}
