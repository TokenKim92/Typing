export default class FontFormat {
  #width;
  #size;
  #name;
  #color;

  constructor(width, size, name, color) {
    this.#width = width;
    this.#size = size;
    this.#name = name;
    this.#color = color;
  }

  get width() {
    return this.#width;
  }

  get size() {
    return this.#size;
  }

  get name() {
    return this.#name;
  }

  get color() {
    return this.#color;
  }

  get font() {
    return `${this.#width} ${this.#size}px ${this.#name}`; // prettier-ignore
  }
}
