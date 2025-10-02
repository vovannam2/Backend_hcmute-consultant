class DataResponse {
  constructor(data, message, status) {
    if (typeof data === 'undefined') throw new Error('DataResponse requires data');
    if (!message) throw new Error('DataResponse requires message');
    if (!status) throw new Error('DataResponse requires status');
    this.status = status;
    this.message = message;
    this.data = data;
  }
}

class ExceptionResponse {
  constructor(message, data, status) {
    if (!message) throw new Error('ExceptionResponse requires message');
    if (!status) throw new Error('ExceptionResponse requires status');
    this.status = status;
    this.message = message;
    if (typeof data !== 'undefined') this.data = data;
  }
}

module.exports = { DataResponse, ExceptionResponse };


