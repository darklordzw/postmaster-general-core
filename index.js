/**
 * Public interface for the package.
 * @module index
 */

const errors = require("./lib/errors");
const Transport = require("./lib/transport");

module.exports = {
  /** Errors module. */
  errors,

  /** Transport class. */
  Transport,
};
