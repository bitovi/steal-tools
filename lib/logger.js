var util = require('util'),
	winston = require('winston'),
	Transport = winston.Transport;

require('colors');

var StealTransport = exports.StealTransport = function (options) {
	Transport.call(this, options);
};

util.inherits(StealTransport, Transport);

StealTransport.prototype.name = 'steal';

StealTransport.prototype.log = function (level, msg, meta, callback) {
	if (this.silent) {
		return callback(null, true);
	}

	var options = this.options;
	var output = '';

	if (level === 'debug') {
		output += msg.grey;
	} else if (level === 'warn') {
		output += ('WARNING: ' + msg).yellow;
	} else if (level === 'error') {
		output += ('ERROR: ' + msg).red;
	} else {
		output += msg;
	}

	if (meta !== null && meta !== undefined) {
		if (meta && meta instanceof Error && meta.stack) {
			meta = meta.stack;
		}

		if (typeof meta !== 'object') {
			output += ' ' + meta;
		}
		else if (Object.keys(meta).length > 0) {
			output += ' ' + ('\n' + util.inspect(meta, false, null, options.colorize));
		}
	}

	if (level === 'error' || level === 'debug') {
		process.stderr.write(output + '\n');
	} else {
		process.stdout.write(output + '\n');
	}

	this.emit('logged');
	callback(null, true);
};

function removeTransports(transports) {
	transports.forEach(function(transport) {
		try {
			winston.remove(transport);
		} catch (e) {
			// We can ignore errors when removing transports
		}
	});
}

exports.setup = function (config) {
	removeTransports([winston.transports.Console, StealTransport]);

	winston.add(StealTransport, {
		level: config.verbose ? 'debug' : 'info',
		colorize: true,
		silent: config.quiet && !config.verbose
	});
};
