/*
 * @Author: gleeman
 * @Date: 2019-08-17 01:34:15
 * @LastEditors: gleeman
 * @LastEditTime: 2019-09-13 20:21:46
 * @Description: func扩展方法
 */

such.define("func", ["assert", "error"], function(assert, error) {
  "use strict";
  
  var func = {
    // fn执行后，将返回结果当参数传给after
    after: function(fn, after) {
      if (!assert.isFunction(fn)) fn = function() {};
      return function() {
        var ret = fn.apply(this, arguments);
        if (assert.isFunction(after)) {
          return after(ret);
        }
        return ret;
      };
    },
    // before执行后，将返回结果当参数传给fn
    before: function(fn, before) {
      if (!assert.isFunction(fn)) fn = function() {};
      return function() {
        var args = Array.prototype.slice.call(arguments);
        var ret = null;
        if (assert.isFunction(before)) {
          ret = before();
        }
        args.unshift(ret);
        return fn.apply(this, args);
      };
    },
    // 推迟调用fn，直到当前堆栈清理完毕。调用时，任何附加的参数会传给fn
    defer: function() {
      var args = Array.prototype.slice.call(arguments);
      var fn = args.shift();
      if (!assert.isFunction(fn)) fn = function() {};
      setTimeout(function() {
        fn(args);
      });
    },
    // 延迟wait毫秒后调用fn调用时，任何附加的参数会传给fn
    delay: function() {
      var args = Array.prototype.slice.call(arguments);
      var fn = args.shift();
      if (!assert.isFunction(fn)) fn = function() {};
      var wait = Math.max(args.shift() | 0, 0);
      setTimeout(function() {
        fn(args);
      }, wait);
    },
    // 柯里化
    curry: function() {
      var args = Array.prototype.slice.call(arguments);
      var fn = args.shift();
      if (!assert.isFunction(fn)) fn = function() {};
      var len = args.length
        ? Math.max(args.shift() | 0, 0)
        : Number.MAX_SAFE_INTEGER;
      var args2 = [];
      var retFn = function() {
        [].push.apply(args2, arguments);
        if (args2.length >= len) {
          return fn.apply(this, args2);
        } else {
          return retFn;
        }
      };
      return retFn;
    },
    curryRight: function() {
      var args = Array.prototype.slice.call(arguments);
      var fn = args.shift();
      if (!assert.isFunction(fn)) fn = function() {};
      var len = args.length
        ? Math.max(args.shift() | 0, 0)
        : Number.MAX_SAFE_INTEGER;
      var args2 = [];
      var retFn = function() {
        [].unshift.apply(args2, arguments);
        if (args2.length >= len) {
          return fn.apply(this, args2);
        } else {
          return retFn;
        }
      };
      return retFn;
    },
    // 偏函数
    partial: function() {
      var args = Array.prototype.slice.call(arguments);
      var fn = args.shift();
      if (!assert.isFunction(fn)) fn = function() {};
      return function() {
        [].push.apply(args, arguments);
        return fn.apply(this, args);
      };
    },
    partialRight: function() {
      var args = Array.prototype.slice.call(arguments);
      var fn = args.shift();
      if (!assert.isFunction(fn)) fn = function() {};
      return function() {
        [].unshift.apply(args, arguments);
        return fn.apply(this, args);
      };
    },
    // 创建一个函数，调用fn时候接收翻转的参数
    flip: function() {
      var args = Array.prototype.slice.call(arguments);
      var fn = args.shift();
      if (!assert.isFunction(fn)) fn = function() {};
      var args2 = [];
      while (args.length) {
        args2.unshift(args.shift());
      }
      return function() {
        var args3 = Array.prototype.slice.call(arguments);
        while (args3.length) {
          args2.unshift(args3.shift());
        }
        return fn.apply(this, args2);
      };
    },
    // 函数重载
    overload: function(object, name, fn) {
      if (!assert.isObjectLike(object)) {
        error.type('"object" must be a Object.');
      }
      if (!assert.isFunction(fn)) {
        error.type('"fn" must be a function.');
      }
      var old = object[name];
      object[name] = function() {
        if (fn.length == arguments.length) return fn.apply(this, arguments);
        else if (assert.isFunction(old)) return old.apply(this, arguments);
      };
    },
    // 防抖函数
    debounce: function(fn, delay) {
      if (!assert.isFunction(fn)) fn = function() {};
      delay = Math.max(delay | 0, 0);
      var timer = null;

      return function() {
        var args = arguments;
        var context = this;

        if (timer) {
          clearTimeout(timer);
          timer = null;
        }

        timer = setTimeout(function() {
          fn.apply(context, args);
        }, delay);
      };
    },
    // 缓存
    memoize: function() {
      var args = Array.prototype.slice.call(arguments);
      var fn = args.shift();
      if (!assert.isFunction(fn)) fn = function() {};
      var cache = {};
      return function() {
        var args2 = Array.prototype.slice.call(arguments);
        var str = args2.join("&");
        if (cache.hasOwnProperty(str)) {
          return cache[str];
        } else {
          return (cache[str] = fn.apply(this, args2));
        }
      };
    },
    // 创建一个只能调用fn一次的函数。重复调用返回第一次调用的结果
    once: function() {
      var args = Array.prototype.slice.call(arguments);
      var fn = args.shift();
      if (!assert.isFunction(fn)) fn = function() {};
      var ret = null;
      var run = false;
      return function() {
        if (run === true) {
          return ret;
        } else {
          run = true;
          return (ret = fn.apply(this, args));
        }
      };
    },
    // 节流函数
    throttle: function(fn, delay) {
      if (!assert.isFunction(fn)) fn = function() {};
      delay = Number(delay) || 250;
      var timer = null,
        remaining = 0,
        previous = new Date();

      return function() {
        var now = new Date(),
          remaining = now - previous,
          args = arguments,
          context = this;

        if (remaining >= delay) {
          if (timer) {
            clearTimeout(timer);
          }

          fn.apply(context, args);
          previous = now;
        } else {
          if (!timer) {
            timer = setTimeout(function() {
              fn.apply(context, args);
              previous = new Date();
            }, delay - remaining);
          }
        }
      };
    },
    // 分时函数
    chunk: function(array, fn, count, timer) {
      if (!assert.isArray(array)) {
        error.type('"array" must be a array.');
      }
      if (!assert.isFunction(fn)) {
        error.type('"fn" must be a function.');
      }

      var t;

      var start = function() {
        for (var i = 0; i < Math.min(count || 1, array.length); i++) {
          fn(array.shift());
        }
      };

      return function() {
        t = setInterval(function() {
          if (array.length === 0) {
            return clearInterval(t);
          }
          start();
        }, parseInt(timer) || 200);
      };
    }
  };

  return func;
});
