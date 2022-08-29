import TypingBanner from './typingBanner.js';

export default class IntroductionBanner extends TypingBanner {
  constructor(fontName, speed = 50,  fontColor = '#ffffff', backgroundColor = '#000000cc') {
    super(fontName, speed, fontColor, backgroundColor);
  } // prettier-ignore

  setMessage() {
    if (!this.isMatchMedia) {
      this.delay(1000)
        .type('Hello,', 100)
        .type(' I am Token Kim.', 100)
        .move(-10, 50)
        .delete(5, 50)
        .type('Deokgeun', 50)
        .moveEnd(100)
        .type(['', 'A Software Engineer of C/C++'], 100)
        .move(-8, 50)
        .delete(8, 50)
        .type('currently residing Dresden, in Germany.', 100)
        .type(['', "It's my portfolio of HTML5"], 100)
        .move(-5, 50)
        .type('interactive ', 100)
        .moveEnd(1000)
        .type(' without library.', 100)
        .type(['', 'Please enjoy this. '], 50)
        .start();
    } else {
      this.delay(1000)
        .type('Hello,', 100)
        .type(' I am Token Kim.', 100)
        .move(-10, 50)
        .delete(5, 50)
        .type('Deokgeun', 50)
        .moveEnd(100)
        .type(['', '', 'A Software Engineer of C/C++'], 100)
        .move(-8, 50)
        .delete(8, 50)
        .type(['currently', 'residing Dresden, in Germany.'], 100)
        .type(['', '', "It's my portfolio of HTML5"], 100)
        .move(-5, 50)
        .delete(5)
        .type('interactive')
        .moveEnd()
        .type(['', 'HTML5'], 1000)
        .type(' without library.', 100)
        .type(['', '', 'Please enjoy this. '], 50)
        .start();
    }
  }
}
