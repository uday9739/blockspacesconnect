class PlatformException extends Error {
  status: number;
  message: string;
  isOperational: boolean;

  constructor(message?: string, status?: number, isOperational?: boolean) {
    super(message); // 'Error' breaks prototype chain here
    Object.setPrototypeOf(this, new.target.prototype); // restore prototype chain
    this.message = typeof message === undefined ? "" : message;
    this.status = typeof status === undefined ? 0 : status;
    this.isOperational = typeof isOperational === undefined ? false : isOperational;
    Error.captureStackTrace(this)
  }
}

export default PlatformException;
