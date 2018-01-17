/* eslint import/no-unassigned-import: 'off' */
/* eslint no-unused-vars: 'off' */
'use strict';

const chai = require('chai');
const dirtyChai = require('dirty-chai');
const sinon = require('sinon');
const Transport = require('../lib/transport');
const defaults = require('../defaults.json');

/* This sets up the Chai assertion library. "should" and "expect"
initialize their respective assertion properties. The "use()" functions
load plugins into Chai. "dirtyChai" just allows assertion properties to
use function call syntax ("calledOnce()" vs "calledOnce"). It makes them more
acceptable to the linter. */
const expect = chai.expect;
chai.should();
chai.use(dirtyChai);

describe('transport:', () => {
	let sandbox;

	before(() => {
		sandbox = sinon.createSandbox();
	});

	afterEach(() => {
		sandbox.reset();
	});

	describe('constructor:', () => {
		it('should properly initialize settings from defaults', () => {
			const transport = new Transport();
			transport.timingsResetInterval.should.equal(defaults.timingsResetInterval);
		});
		it('should properly initialize settings from input', () => {
			const transport = new Transport({ timingsResetInterval: 100 });
			transport.timingsResetInterval.should.equal(100);
		});
		it('should error on invalid input', () => {
			try {
				const transport = new Transport({ timingsResetInterval: 'bob' });
			} catch (err) {
				return;
			}
			throw new Error('Failed to catch invalid input.');
		});
	});

	describe('connect:', () => {
		it('should return a promise that resolves', () => {
			const transport = new Transport();
			return transport.connect();
		});
	});

	describe('disconnect:', () => {
		it('should return a promise that resolves', () => {
			const transport = new Transport();
			return transport.disconnect();
		});
		it('should cleanup resources', () => {
			const transport = new Transport();
			transport.listening = true;
			return transport.disconnect()
				.then(() => {
					transport.listening.should.be.false();
				});
		});
	});

	describe('resolveTopic:', () => {
		it('should catch invalid input', () => {
			try {
				const transport = new Transport();
				transport.resolveTopic(3353553);
			} catch (err) {
				return;
			}
			throw new Error('Failed to catch invalid input.');
		});
		it('should return the decoded input', () => {
			const transport = new Transport();
			const result = transport.resolveTopic('bob');
			result.should.equal('bob');
		});
	});

	describe('addListener:', () => {
		it('should return a promise that resolves', () => {
			const transport = new Transport();
			return transport.addListener('bob', () => {
				return Promise.resolve();
			});
		});
		it('should catch invalid routingKey params', () => {
			const transport = new Transport();
			return transport.addListener(44444, () => {
				return Promise.resolve();
			})
				.then(() => {
					throw new Error('Failed to catch invalid input.');
				})
				.catch((err) => {
					if (!(err instanceof TypeError)) {
						throw err;
					}
				});
		});
		it('should catch invalid callback params', () => {
			const transport = new Transport();
			return transport.addListener('bob')
				.then(() => {
					throw new Error('Failed to catch invalid input.');
				})
				.catch((err) => {
					if (!(err instanceof TypeError)) {
						throw err;
					}
				});
		});
		it('should register a callback with appropriate params', () => {
			const transport = new Transport();
			const spy = sinon.spy(() => {
				return Promise.resolve();
			});
			const spy2 = sinon.spy(transport, 'recordTiming');
			return transport.addListener('bob', spy)
				.then((handler) => handler({ test: true }))
				.then((handler) => {
					spy.calledOnce.should.be.true();
					spy.calledWith({ test: true }).should.be.true();
					spy2.calledOnce.should.be.true();
					spy.reset();
					spy2.reset();
				})
				.then(() => transport.addListener('bob2', spy))
				.then((handler) => handler({ test: true, correlationId: 'ggg', initiator: 'fff' }))
				.then((handler) => {
					spy.calledOnce.should.be.true();
					spy2.calledOnce.should.be.true();
					spy.calledWith({ test: true, correlationId: 'ggg', initiator: 'fff' }).should.be.true();
				});
		});
	});

	describe('recordTiming:', () => {
		it('should catch invalid topic input', () => {
			try {
				const transport = new Transport();
				transport.recordTiming(3353553, new Date().getTime());
			} catch (err) {
				return;
			}
			throw new Error('Failed to catch invalid input.');
		});
		it('should catch invalid start input', () => {
			try {
				const transport = new Transport();
				transport.recordTiming('bob', 'invalid');
			} catch (err) {
				return;
			}
			throw new Error('Failed to catch invalid input.');
		});
		it('should calculate the timing stats', () => {
			const transport = new Transport();
			transport.recordTiming('bob', new Date().getTime());
			expect(transport.timings.bob).to.exist();
			transport.timings.bob.messageCount.should.equal(1);
			transport.timings.bob.minElapsedTime.should.equal(transport.timings.bob.elapsedTime);
			transport.timings.bob.maxElapsedTime.should.equal(transport.timings.bob.elapsedTime);
		});
	});

	describe('resetTimings:', () => {
		it('should reset the timings', () => {
			const transport = new Transport();
			return transport.addListener('bob', () => {
				return Promise.resolve();
			})
				.then(() => transport.recordTiming('bob', new Date().getTime()))
				.then(() => {
					expect(transport.timings.bob).to.exist();
				})
				.then(() => transport.resetTimings())
				.then(() => {
					expect(transport.timings.bob).to.not.exist();
				});
		});
	});

	describe('removeListener:', () => {
		it('should return a promise that resolves', () => {
			const transport = new Transport();
			return transport.removeListener('bob');
		});
		it('should catch invalid routingKey params', () => {
			const transport = new Transport();
			return transport.publish(35353535)
				.then(() => {
					throw new Error('Failed to catch invalid input.');
				})
				.catch((err) => {
					if (!(err instanceof TypeError)) {
						throw err;
					}
				});
		});
		it('should remove timing data for the listener', () => {
			const transport = new Transport();
			return transport.addListener('bob', () => {
				return Promise.resolve();
			})
				.then(() => transport.recordTiming('bob', new Date().getTime()))
				.then(() => {
					expect(transport.timings.bob).to.exist();
				})
				.then(() => transport.removeListener('bob'))
				.then(() => {
					expect(transport.timings.bob).to.not.exist();
				});
		});
	});

	describe('listen:', () => {
		it('should return a promise that resolves', () => {
			const transport = new Transport();
			return transport.listen();
		});
		it('should start listening', () => {
			const transport = new Transport();
			return transport.listen()
				.then(() => {
					transport.listening.should.be.true();
				});
		});
	});

	describe('publish:', () => {
		it('should return a promise that resolves', () => {
			const transport = new Transport();
			return transport.publish('bob');
		});
		it('should catch invalid routingKey params', () => {
			const transport = new Transport();
			return transport.publish(35353535)
				.then(() => {
					throw new Error('Failed to catch invalid input.');
				})
				.catch((err) => {
					if (!(err instanceof TypeError)) {
						throw err;
					}
				});
		});
		it('should catch invalid correlationId params', () => {
			const transport = new Transport();
			return transport.publish('bob', {}, { correlationId: 44444 })
				.then(() => {
					throw new Error('Failed to catch invalid input.');
				})
				.catch((err) => {
					if (!(err instanceof TypeError)) {
						throw err;
					}
				});
		});
		it('should catch invalid initiator params', () => {
			const transport = new Transport();
			return transport.publish('bob', {}, { initiator: 44444 })
				.then(() => {
					throw new Error('Failed to catch invalid input.');
				})
				.catch((err) => {
					if (!(err instanceof TypeError)) {
						throw err;
					}
				});
		});
	});

	describe('request:', () => {
		it('should return a promise that resolves', () => {
			const transport = new Transport();
			return transport.request('bob');
		});
		it('should catch invalid routingKey params', () => {
			const transport = new Transport();
			return transport.request(35353535)
				.then(() => {
					throw new Error('Failed to catch invalid input.');
				})
				.catch((err) => {
					if (!(err instanceof TypeError)) {
						throw err;
					}
				});
		});
		it('should catch invalid correlationId params', () => {
			const transport = new Transport();
			return transport.request('bob', {}, { correlationId: 44444 })
				.then(() => {
					throw new Error('Failed to catch invalid input.');
				})
				.catch((err) => {
					if (!(err instanceof TypeError)) {
						throw err;
					}
				});
		});
		it('should catch invalid initiator params', () => {
			const transport = new Transport();
			return transport.request('bob', {}, { initiator: 44444 })
				.then(() => {
					throw new Error('Failed to catch invalid input.');
				})
				.catch((err) => {
					if (!(err instanceof TypeError)) {
						throw err;
					}
				});
		});
	});
});
