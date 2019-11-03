/*
 * @Author: gleeman
 * @Date: 2019-08-17 01:34:15
 * @LastEditors: gleeman
 * @LastEditTime: 2019-09-08 17:27:32
 * @Description: event-emitter 事件订阅发布
 */

such.define("event-emitter", ["assert", "error"], function(assert, error) {
  "use strict";

  function EventEmitter() {
    this.events = {};
    this._maxListeners = 16;
  }

  EventEmitter.prototype.setMaxListeners = function(maxListeners) {
    this._maxListeners = parseInt(maxListeners);
  };

  EventEmitter.prototype.listeners = function(event) {
    return this.events[event];
  };

  EventEmitter.prototype.on = EventEmitter.prototype.addListener = function(
    type,
    listener
  ) {
    if (!assert.isFunction(listener)) {
      error.type('"listener" must be a function.');
    }
    if (this.events[type]) {
      this.events[type].push(listener);
      if (
        this._maxListeners != 0 &&
        this.events[type].length > this._maxListeners
      ) {
        error.error(
          "MaxListenersExceededWarning: Possible EventEmitter memory leak detected. " +
            this.events[type].length +
            " " +
            type +
            " listeners added. Use emitter.setMaxListeners() to increase limit"
        );
      }
    } else {
      this.events[type] = [listener];
    }
  };

  EventEmitter.prototype.once = function(type, listener) {
    var self = this;
    var wrapper = function() {
      listener.apply(self, arguments);
      self.removeListener(type, wrapper);
    };
    this.on(type, wrapper);
  };

  EventEmitter.prototype.removeListener = function(type, listener) {
    if (this.events[type]) {
      this.events[type] = this.events[type].filter(function(l) {
        return l !== listener;
      });
    }
  };

  EventEmitter.prototype.removeAllListeners = function(type) {
    delete this.events[type];
  };

  EventEmitter.prototype.emit = function(type) {
    var self = this;
    var args = Array.prototype.slice.call(arguments, 1);
    this.events[type] &&
      this.events[type].forEach(function(listener) {
        listener.apply(self, args);
      });
  };

  return EventEmitter;
});
