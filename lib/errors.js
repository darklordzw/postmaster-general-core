/* istanbul ignore next */
'use strict';

/**
 * Module representing a set of common errors.
 * @module lib/errors
 */

/**
 * Error generated when a function is called that isn't implemented.
 */
class NotImplementedError extends Error {
	/**
	 * Constructor for the error.
	 * @param {string} message - The error message.
	 */
	constructor(message) {
		super(message);
		this.name = 'NotImplementedError';
		Error.captureStackTrace(this, this.constructor);
	}
}

/**
 * Error generated when a transport is disconnected and cannot reconnect.
 */
class TransportDisconnectedError extends Error {
	/**
	 * Constructor for the error.
	 * @param {string} message - The error message.
	 */
	constructor(message) {
		super(message);
		this.name = 'TransportDisconnectedError';
		Error.captureStackTrace(this, this.constructor);
	}
}

/**
 * Error generated when there is an error sending a message.
 */
class RequestError extends Error {
	/**
	 * Constructor for the error.
	 * @param {string} message - The error message.
	 */
	constructor(message) {
		super(message);
		this.name = 'RequestError';
		Error.captureStackTrace(this, this.constructor);
	}
}

/**
 * Error generated when there is an error with the response to a request.
 * Base class for more specific response errors.
 */
class ResponseError extends Error {
	/**
	 * Constructor for the error.
	 * @param {string} message - The error message.
	 * @param {object} response - The response to the request.
	 * @param {boolean} [skipLog] - If true, the error should not be automatically logged.
	 */
	constructor(message, response, skipLog) {
		super(message);
		this.name = 'ResponseError';
		Error.captureStackTrace(this, this.constructor);
		this.response = response;
		this.skipLog = skipLog;
	}
}

/**
 * Response error generated when the sent message was invalid.
 * @see {@link https://developer.mozilla.org/en-US/docs/Web/HTTP/Status/400|HTTP 400}
 * @extends module:lib/errors~ResponseError
 */
class InvalidMessageError extends ResponseError {
	/**
	 * Constructor for the error.
	 * @param {string} message - The error message.
	 * @param {object} response - The response to the request.
	 * @param {boolean} [skipLog] - If true, the error should not be automatically logged.
	 */
	constructor(message, response, skipLog) {
		super(message, response, skipLog);
		this.name = 'InvalidMessageError';
		Error.captureStackTrace(this, this.constructor);
	}
}

/**
 * Response error generated when the caller is not authenticated to make the request.
 * @see {@link https://developer.mozilla.org/en-US/docs/Web/HTTP/Status/401|HTTP 401}
 * @extends module:lib/errors~ResponseError
 */
class UnauthorizedError extends ResponseError {
	/**
	 * Constructor for the error.
	 * @param {string} message - The error message.
	 * @param {object} response - The response to the request.
	 * @param {boolean} [skipLog] - If true, the error should not be automatically logged.
	 */
	constructor(message, response, skipLog) {
		super(message, response, skipLog);
		this.name = 'UnauthorizedError';
		Error.captureStackTrace(this, this.constructor);
	}
}

/**
 * Response error enerated when the caller is authenticated but forbidden to make the request.
 * @see {@link https://developer.mozilla.org/en-US/docs/Web/HTTP/Status/403|HTTP 403}
 * @extends module:lib/errors~ResponseError
 */
class ForbiddenError extends ResponseError {
	/**
	 * Constructor for the error.
	 * @param {string} message - The error message.
	 * @param {object} response - The response to the request.
	 * @param {boolean} [skipLog] - If true, the error should not be automatically logged.
	 */
	constructor(message, response, skipLog) {
		super(message, response, skipLog);
		this.name = 'ForbiddenError';
		Error.captureStackTrace(this, this.constructor);
	}
}

/**
 * Response error generated when the requested resource could not be found.
 * @see {@link https://developer.mozilla.org/en-US/docs/Web/HTTP/Status/404|HTTP 404}
 * @extends module:lib/errors~ResponseError
 */
class NotFoundError extends ResponseError {
	/**
	 * Constructor for the error.
	 * @param {string} message - The error message.
	 * @param {object} response - The response to the request.
	 * @param {boolean} [skipLog] - If true, the error should not be automatically logged.
	 */
	constructor(message, response, skipLog) {
		super(message, response, skipLog);
		this.name = 'NotFoundError';
		Error.captureStackTrace(this, this.constructor);
	}
}

/**
 * Response error generated when there is a general error while processing the request.
 * @see {@link https://developer.mozilla.org/en-US/docs/Web/HTTP/Status/500|HTTP_500}
 * @extends module:lib/errors~ResponseError
 */
class ResponseProcessingError extends ResponseError {
	/**
	 * Constructor for the error.
	 * @param {string} message - The error message.
	 * @param {object} response - The response to the request.
	 * @param {boolean} [skipLog] - If true, the error should not be automatically logged.
	 */
	constructor(message, response, skipLog) {
		super(message, response, skipLog);
		this.name = 'ResponseProcessingError';
		Error.captureStackTrace(this, this.constructor);
	}
}

module.exports = {
	NotImplementedError,
	TransportDisconnectedError,
	RequestError,
	ResponseError,
	InvalidMessageError,
	UnauthorizedError,
	ForbiddenError,
	NotFoundError,
	ResponseProcessingError
};
