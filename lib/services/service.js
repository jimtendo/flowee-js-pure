const _ = require('lodash');
const Message = require('../message');

/**
 * Base Service class
 * @private
 * @param {Flowee} instance Instance of Flowee
 */
class Service {
  constructor(instance) {
    this.instance = instance;
    
    this._registerHandlers();
  }
  
  /**
   * This function is loaded when class is initialized and will automatically
   * load any function that begins with "_handle".
   * It is used as a convenience so we don't have to register handlers
   * manually in the constructors of each class.
   */
  _registerHandlers() {
    let obj = this;
    while (obj = Reflect.getPrototypeOf(obj)) {
      let keys = Reflect.ownKeys(obj)
      keys.forEach((method) => {
        if (method.startsWith('_handle')) {
          this[method]();
        }
      });
    }
  }
}

module.exports = Service;
