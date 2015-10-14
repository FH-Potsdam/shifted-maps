var Readable = require('stream').Readable,
  util = require('util'),
  MovesAPI = require('./api'),
  moment = require('moment'),
  _ = require('lodash');

function MovesSegmentReader(api, firstDate) {
  Readable.call(this, { objectMode: true });

  this._api = api;
  this._firstDate = firstDate;
  this._inited = false;
  this._destroyed = false;
}

util.inherits(MovesSegmentReader, Readable);

MovesSegmentReader.prototype._init = function() {
  if (this._inited || this._destroyed)
    return;

  this._inited = true;
  this._months = moment().diff(this._firstDate, 'month');
  this._query = { updatedSince: MovesAPI.formatDate(this._firstDate) };

  this._initRequest(0);
};

MovesSegmentReader.prototype._initRequest = function(months) {
  if (this._destroyed || months >= this._months)
    return this.push(null);

  var reader = this,
    month = moment(this._firstDate).add(months, 'month');

  this._api.daily('/user/storyline', month.format('YYYY-MM'), this._query, function(request) {
    reader._handleRequest(months, request)
  });
};

MovesSegmentReader.prototype._handleRequest = function(months, request) {
  var reader = this;

  request
    .node('startTime', function(startTime) {
      return moment(MovesAPI.parseDate(startTime)).unix();
    })
    .node('endTime', function(endTime) {
      return moment(MovesAPI.parseDate(endTime)).unix();
    })
    .node('segments.*', function(segment) {
      reader.push(segment);
    })
    .done(function() {
      reader._initRequest(months + 1);
    })
    .fail(function(error) {
      reader.emit('error', error.thrown || error);
    });
};

MovesSegmentReader.prototype._read = function() {
  this._init();
};

MovesSegmentReader.prototype.destroy = function() {
  this._destroyed = true;
};

module.exports = MovesSegmentReader;