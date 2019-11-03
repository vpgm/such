/*
 * @Author: gleeman
 * @Date: 2019-09-07 08:46:34
 * @LastEditors: gleeman
 * @LastEditTime: 2019-11-02 14:31:57
 * @Description: axis-promise
 */

such.define("axis-promise", ["assert", "error"], function(assert, error) {
  "use strict";

  var PENDING = "pending";
  var FULFILLED = "fulfilled";
  var REJECTED = "rejected";

  function AxisPromise(fn) {
    var self = this;
    self.value = null;
    self.error = null;
    self.status = PENDING;
    self.onFulfilledCallbacks = [];
    self.onRejectedCallbacks = [];

    function resolve(value) {
      if (value instanceof AxisPromise) {
        return value.then(resolve, reject);
      }
      if (self.status === PENDING) {
        AxisPromise.nextTick(function() {
          self.status = FULFILLED;
          self.value = value;
          for (var i = 0; i < self.onFulfilledCallbacks.length; i++) {
            self.onFulfilledCallbacks[i](self.value);
          }
        });
      }
    }

    function reject(error) {
      if (self.status === PENDING) {
        AxisPromise.nextTick(function() {
          self.status = REJECTED;
          self.value = error;
          for (var i = 0; i < self.onRejectedCallbacks.length; i++) {
            self.onRejectedCallbacks[i](self.value);
          }
        });
      }
    }

    try {
      fn(resolve, reject);
    } catch (e) {
      reject(e);
    }
  }

  function resolvePromise(bridgepromise, x, resolve, reject) {
    if (bridgepromise === x) {
      return reject(error.type("Circular reference"));
    }

    var called = false;
    if (x instanceof AxisPromise) {
      if (x.status === PENDING) {
        x.then(
          function(y) {
            resolvePromise(bridgepromise, y, resolve, reject);
          },
          function(error) {
            reject(error);
          }
        );
      } else {
        x.then(resolve, reject);
      }
    } else if (
      !assert.isNull(x) &&
      (assert.isObject(x) || assert.isFunction(x))
    ) {
      try {
        var then = x.then;
        if (typeof then === "function") {
          then.call(
            x,
            function(y) {
              if (called) return;
              called = true;
              resolvePromise(bridgepromise, y, resolve, reject);
            },
            function(error) {
              if (called) return;
              called = true;
              reject(error);
            }
          );
        } else {
          resolve(x);
        }
      } catch (e) {
        if (called) return;
        called = true;
        reject(e);
      }
    } else {
      resolve(x);
    }
  }

  AxisPromise.prototype.then = function(onFulfilled, onRejected) {
    var self = this;
    var bridgePromise;

    onFulfilled = assert.isFunction(onFulfilled)
      ? onFulfilled
      : function(value) {
          return value;
        };
    onRejected = assert.isFunction(onRejected)
      ? onRejected
      : function(error) {
          throw error;
        };

    if (self.status === FULFILLED) {
      return (bridgePromise = new AxisPromise(function(resolve, reject) {
        AxisPromise.nextTick(function() {
          try {
            var x = onFulfilled(self.value);
            resolvePromise(bridgePromise, x, resolve, reject);
          } catch (e) {
            reject(e);
          }
        });
      }));
    } else if (self.status === REJECTED) {
      return (bridgePromise = new AxisPromise(function(resolve, reject) {
        AxisPromise.nextTick(function() {
          try {
            var x = onRejected(self.error);
            resolvePromise(bridgePromise, x, resolve, reject);
          } catch (e) {
            reject(e);
          }
        });
      }));
    } else {
      // self.status === PENDING
      return (bridgePromise = new AxisPromise(function(resolve, reject) {
        self.onFulfilledCallbacks.push(function(value) {
          try {
            var x = onFulfilled(value);
            resolvePromise(bridgePromise, x, resolve, reject);
          } catch (e) {
            reject(e);
          }
        });
        self.onRejectedCallbacks.push(function(error) {
          try {
            var x = onRejected(error);
            resolvePromise(bridgePromise, x, resolve, reject);
          } catch (e) {
            reject(e);
          }
        });
      }));
    }
  };

  AxisPromise.prototype["catch"] = function(onRejected) {
    return this.then(null, onRejected);
  };

  AxisPromise.prototype["finally"] = function(fn) {
    return this.then(
      function(value) {
        return AxisPromise.resolve(fn()).then(function() {
          return value;
        });
      },
      function(err) {
        return AxisPromise.resolve(fn()).then(function() {
          throw err;
        });
      }
    );
  };

  AxisPromise.nextTick = function(cb) {
    if (typeof MutationObserver !== "undefined") {
      AxisPromise.nextTick = function(cb) {
        var targetNode = document.createElement("i");
        targetNode.id = "INITIAL";
        var config = {
          attributes: true
        };
        var mutationCallback = function(mutationsList) {
          for (var mutation in mutationsList) {
            if (mutationsList[mutation].type === "attributes") {
              assert.isFunction(cb) && cb();
            }
          }
        };
        var observer = new MutationObserver(mutationCallback);
        observer.observe(targetNode, config);
        targetNode.id = "INITIALIZED";
      };
    } else if (typeof MessageChannel !== "undefined") {
      // messageChannel(宏任务)比一般的定时器(IE10除外)优先级要高
      AxisPromise.nextTick = function(cb) {
        var mc = new MessageChannel();
        var port1 = mc.port1;
        var port2 = mc.port2;
        assert.isFunction(cb) && (cb = function() {});
        port1.postMessage({});
        port2.onmessage = cb;
      };
    } else {
      AxisPromise.nextTick = function(cb) {
        setTimeout(function() {
          assert.isFunction(cb) && cb();
        }, 0);
      };
    }

    AxisPromise.nextTick(cb);
  };

  AxisPromise.resolve = function(value) {
    return new AxisPromise(function(resolve) {
      resolve(value);
    });
  };

  AxisPromise.reject = function(error) {
    return new AxisPromise(function(resolve, reject) {
      reject(error);
    });
  };

  AxisPromise.all = function(promises) {
    return new AxisPromise(function(resolve, reject) {
      var result = [];
      var count = 0;
      for (var i = 0; i < promises.length; i++) {
        promises[i].then(
          function(data) {
            result[i] = data;
            if (++count == promises.length) {
              resolve(result);
            }
          },
          function(error) {
            reject(error);
          }
        );
      }
    });
  };

  AxisPromise.race = function(promises) {
    return new AxisPromise(function(resolve, reject) {
      for (var i = 0; i < promises.length; i++) {
        promises[i].then(
          function(data) {
            resolve(data);
          },
          function(error) {
            reject(error);
          }
        );
      }
    });
  };

  AxisPromise.promisify = function(fn) {
    return function() {
      var args = Array.prototype.slice.call(arguments);
      return new AxisPromise(function(resolve, reject) {
        fn.apply(
          null,
          args.concat(function(err) {
            err ? reject(err) : resolve(arguments[1]);
          })
        );
      });
    };
  };

  return AxisPromise;
});
