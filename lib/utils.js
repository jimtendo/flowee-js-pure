class ErrorWith {
  constructor(message, params) {
    let error = new Error(message);
    for (let key in params) {
      error[key] = params[key];
    }
    return error;
  }
}

module.exports = { ErrorWith };
