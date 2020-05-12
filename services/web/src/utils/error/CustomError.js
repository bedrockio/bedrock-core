// This simply makes custom errors look good in the console.

export default class CustomError extends Error {

  get name() {
    return this.constructor.name;
  }

}
