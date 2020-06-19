// All common browsers limit the interval to 2^31 numbers.
// For this reason, we need some workarounds if we want to use intervals larger than that.

exports.maxInterval = Math.pow(2, 31) - 1;

function clamp(interval) {
	return interval <= exports.maxInterval ? interval : exports.maxInterval;
}


function Timeout(cb, args, thisArg) {
	this.timestamp = null;
	this.timer = null;
	this.cb = cb;
	this.args = args;
	this.thisArg = thisArg;
}

Timeout.fired = function (timeout) {
	var now = Date.now();

	if (timeout.timestamp > now) {
		timeout.reschedule(timeout.timestamp - now);
	} else {
		timeout.fireNow();
	}
};

Timeout.prototype.reschedule = function (interval) {
	this.clear();
	this.timer = setTimeout(Timeout.fired, clamp(interval), this);
};

Timeout.prototype.fireNow = function () {
	this.clear();
	this.cb.apply(this.thisArg, this.args);
};

Timeout.prototype.fireAt = function (timestamp) {
	this.timestamp = timestamp;

	this.reschedule(timestamp - Date.now());
};

Timeout.prototype.fireIn = function (interval) {
	this.timestamp = Date.now() + interval;

	this.reschedule(interval);
};

Timeout.prototype.clear = function () {
	if (this.timer) {
		clearTimeout(this.timer);
		this.timer = null;
	}
};


function Interval(cb, args, thisArg) {
	var that = this;

	var callback = function () {
		that.timeout.fireIn(that.interval);
		cb.apply(that.timeout.thisArg, that.timeout.args);
	};

	this.timeout = new Timeout(callback, args, thisArg);
	this.interval = null;
}

Interval.prototype.fireEvery = function (interval) {
	this.interval = interval;
	this.timeout.fireIn(interval);
};

Interval.prototype.clear = function () {
	this.timeout.clear();
};


exports.Timeout = Timeout;
exports.Interval = Interval;


exports.setTimeoutAt = function (cb, timestamp) {
	var args = [];
	for (var i = 2; i < arguments.length; i += 1) {
		args.push(arguments[i]);
	}

	var timer = new Timeout(cb, args, this);
	timer.fireAt(timestamp);
	return timer;
};

exports.setTimeout = function (cb, interval) {
	var args = [];
	for (var i = 2; i < arguments.length; i += 1) {
		args.push(arguments[i]);
	}

	var timer = new Timeout(cb, args, this);
	timer.fireIn(interval);
	return timer;
};

exports.setInterval = function (cb, interval) {
	var args = [];
	for (var i = 2; i < arguments.length; i += 1) {
		args.push(arguments[i]);
	}

	var timer = new Interval(cb, args, this);
	timer.fireEvery(interval);
	return timer;
};

exports.clearTimeout = exports.clearInterval = function (timer) {
	if (timer && typeof timer.clear === 'function') {
		timer.clear();
	}
};
