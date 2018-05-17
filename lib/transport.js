'use strict';

/**
 * Base class of all transport modules.
 * @module lib/transport
 */

const EventEmitter = require('events');
const uuidv4 = require('uuid/v4');
const defaults = require('../defaults');

/**
 * Used by the "publish" and "request" methods to validate messages and perform pre-processing.
 * @param {string} routingKey The routing key to attach to the message.
 * @param {Object} [message] The message data to publish.
 * @param {Object} [options] Optional message parameters.
 * @param {Object} [options.correlationId] Optional marker used for tracing requests through the system.
 * @param {Object} [options.initiator] Optional marker used for identifying the user who generated the initial request.
 * @returns {string} The correlationId of the message. If none was passed in the 'options' param, a new one will be generated.
 */
function _processMessage(routingKey, message, options) {
	options = options || {};
	if (typeof routingKey !== 'string') {
		throw new TypeError('"routingKey" should be a string.');
	}
	if (typeof options.correlationId !== 'undefined' && typeof options.correlationId !== 'string') {
		throw new TypeError('"options.correlationId" should be a string.');
	}
	if (typeof options.initiator !== 'undefined' && typeof options.initiator !== 'string') {
		throw new TypeError('"options.initiator" should be a string.');
	}
	if (typeof options.correlationId === 'undefined') {
		options.correlationId = uuidv4();
	}
	return options.correlationId;
}

/**
 * Base class of all transports.
 */
class Transport extends EventEmitter {
	/**
	 * Constructor for the Transport object.
	 * @param {Object} [options] Optional settings.
	 * @param {number} [options.timingsResetInterval] How frequently should the transport clear its timing metrics, in milliseconds.
	 */
	constructor(options) {
		super();
		options = options || {};

		if (typeof options.timingsResetInterval !== 'undefined' && !Number.isInteger(options.timingsResetInterval)) {
			throw new TypeError('"options.timingsResetInterval" should be a number.');
		}

		this._timings = {};
		this._listening = false;
		this._timingsResetInterval = options.timingsResetInterval || defaults.timingsResetInterval;
		this._timingsTimeout = null;
		this._logger = options.logger;
	}

	/**
	 * An mapping of message routing keys to timing data.
	 */
	get timings() {
		return this._timings;
	}

	/**
	 * True if the transport is listening for messages. False otherwise.
	 */
	get listening() {
		return this._listening;
	}

	/**
	 * The logger that the transport uses to record ResponseErrors.
	 */
	get logger() {
		return this._logger;
	}

	/**
	 * Connects the transport to any services it needs to function.
	 */
	async connect() {}

	/**
	 * Disconnects the transport from any services it references.
	 */
	async disconnect() {
		this._listening = false;
		if (this._timingsTimeout) {
			clearTimeout(this._timingsTimeout);
		}
	}

	/**
	 * Processes a routing key into a format appropriate for the transport type.
	 * @param {string} routingKey The routing key to convert.
	 * @returns {string} The routingKey parameter.
	 */
	resolveTopic(routingKey) {
		if (typeof routingKey !== 'string') {
			throw new TypeError('"routingKey" should be a string.');
		}
		return routingKey;
	}

	/**
	 * Adds a new message handler.
	 * @param {string} routingKey The routing key of the message to handle.
	 * @param {function} callback The function to call when a new message is received.
	 * @returns {Promise} Returns the wrapped callback handler for the message.
	 */
	async addMessageListener(routingKey, callback) {
		if (typeof routingKey !== 'string') {
			throw new TypeError('"routingKey" should be a string.');
		}
		if (typeof callback !== 'function') {
			throw new TypeError('"callback" should be a function that returns a Promise.');
		}

		const topic = this.resolveTopic(routingKey);

		return async (msg, correlationId, initiator) => {
			const start = new Date().getTime();
			try {
				const res = await callback(msg, correlationId, initiator);
				this._recordTiming(topic, start);
				return res;
			} catch (err) {
				this._recordTiming(topic, start);

				// Add automatic logging of all errors unless specified.
				const logLevel = err.logLevel || 'error';
				if (this._logger && logLevel !== 'none' && this._logger[logLevel]) {
					this._logger[logLevel](`Encountered error processing message: '${msg}'. `, err);
				}

				throw err;
			}
		};
	}

	/**
	 * Logs timing data for message handlers.
	 * @param {string} topic The processed routing key of the message to time.
	 * @param {number} start The timestamp at which the message handler started processing.
	 */
	_recordTiming(topic, start) {
		if (typeof topic !== 'string') {
			throw new TypeError('"topic" should be a string.');
		}
		if (!Number.isInteger(start)) {
			throw new TypeError('"start" should be a number.');
		}

		const elapsed = new Date().getTime() - start;
		this._timings[topic] = this._timings[topic] || {
			messageCount: 0,
			elapsedTime: 0,
			minElapsedTime: 0,
			maxElapsedTime: 0
		};
		this._timings[topic].messageCount++;
		this._timings[topic].elapsedTime += elapsed;

		if (this._timings[topic].minElapsedTime > elapsed ||
			this._timings[topic].minElapsedTime === 0) {
			this._timings[topic].minElapsedTime = elapsed;
		}
		if (this._timings[topic].maxElapsedTime < elapsed) {
			this._timings[topic].maxElapsedTime = elapsed;
		}
	}

	/**
	 * Called periodically to reset handler timings to keep the data sample fresh.
	 */
	_resetTimings() {
		this._timings = {};
		if (this._listening) {
			this._timingsTimeout = setTimeout(() => this._resetTimings(), this._timingsResetInterval);
		}
	}

	/**
	 * Starts listening to messages.
	 */
	async listen() {
		this._listening = true;
		this._resetTimings();
	}

	/**
	 * Publishes a fire-and-forget message that is not expected to return a meaningful response.
	 * This base class implementation resolves to the correlationId of the message, either passed or generated.
	 * @param {string} routingKey The routing key to attach to the message.
	 * @param {Object} [message] The message data to publish.
	 * @param {Object} [options] Optional publishing options.
	 * @param {Object} [options.correlationId] Optional marker used for tracing requests through the system.
	 * @param {Object} [options.initiator] Optional marker used for identifying the user who generated the initial request.
	 * @returns {Promise} Returns a Promise that resolves when the message has been sent.
	 */
	async publish(routingKey, message, options) {
		return _processMessage(routingKey, message, options);
	}

	/**
	 * Publishes an RPC-style message that waits for a response.
	 * This base class implementation resolves to the correlationId of the message, either passed or generated.
	 * @param {string} routingKey The routing key to attach to the message.
	 * @param {Object} [message] The message data to publish.
	 * @param {Object} [options] Optional publishing options.
	 * @param {Object} [options.correlationId] Optional marker used for tracing requests through the system.
	 * @param {Object} [options.initiator] Optional marker used for identifying the user who generated the initial request.
	 * @returns {Promise} Returns a promise that resolves when the message has been sent and a response has been received.
	 */
	async request(routingKey, message, options) {
		return _processMessage(routingKey, message, options);
	}
}

module.exports = Transport;
