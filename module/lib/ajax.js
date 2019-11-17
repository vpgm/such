/*
 * @Author: gleeman
 * @Date: 2019-08-17 01:34:15
 * @LastEditors: gleeman
 * @LastEditTime: 2019-11-17 18:47:25
 * @Description: ajax
 */

such.define("ajax", ["assert", "string", "axis-promise"], function(
  assert,
  string,
  AxisPromise
) {
  "use strict";

  var rejectType = {
    method: "invalid request method",
    headers: '"headers" must be a plainObject',
    TIMEOUT: "request timeout.",
    ABORT: "request abort.",
    ERROR: "request error."
  };

  var paramsEntry = function(args) {
    var ret = {};
    var _args = [].slice.call(args, 0);
    if (_args[0] instanceof Object) {
      ret = such.assign(ret, _args[0]);
    } else {
      ret.method = "get";
      ret.url = _args[0];
      ret.params = _args[1];
      ret.headers = _args[2];
    }
    return ret;
  };

  var XHR = (function() {
    return window.XMLHttpRequest || window.ActiveXObject;
  })();

  function ajax() {
    var options = paramsEntry(arguments);
    return ajax.request(options);
  }

  ajax.abort = false;

  ajax.defaults = {
    baseURL: "",
    timeout: "",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded"
    }
  };

  ajax.request = function(options) {
    var me = this;
    var raceArr = [];
    var timeout = Number(options.timeout || me.defaults.timeout);
    if (timeout) {
      var timeoutPromise = new AxisPromise(function(resolve, reject) {
        setTimeout(function() {
          reject(rejectType.TIMEOUT);
        }, timeout);
      });
      raceArr.push(timeoutPromise);
    }
    var fetchPromise = new AxisPromise(function(resolve, reject) {
      var url, method, headers, xhr, payload, async;
      if (!(options instanceof Object)) {
        return reject('"options" must be a object.');
      }
      try {
        url = (options.baseURL || me.defaults.baseURL || "") + options.url;
        method = options.method;
        headers = options.headers || me.defaults.headers;
        async = options.async === false ? false : true;
        if (
          !assert.isString(method) ||
          !method.match(/get|post|put|delete|options/i)
        ) {
          return reject(rejectType.method);
        } else {
          method = method.toUpperCase();
        }
        if (!assert.isPlainObject(headers)) {
          return reject(rejectType.headers);
        }
        xhr = new XHR();
        payload = assert.isFunction(options.paramsSerializer)
          ? options.paramsSerializer(options.params)
          : options.params;
        if (method === "GET") {
          payload = string.toQueryString(payload, true);
          url += "?" + payload;
          payload = null;
        }
        xhr.open(method, url, async);
        for (var h in headers) {
          if (headers.hasOwnProperty(h)) {
            xhr.setRequestHeader(h, headers[h]);
          }
        }
        xhr.onerror = function() {
          reject(rejectType.ERROR);
        };
        xhr.ontimeout = function() {
          reject(rejectType.TIMEOUT);
        };
        xhr.onabort = function() {
          me.abort = false;
          reject(rejectType.ABORT);
        };
        xhr.onreadystatechange = function() {
          if (me.abort) {
            xhr.abort();
          }
          if (xhr.readyState === 4) {
            var res = xhr.responseText;
            if (assert.isFunction(options.transformResponse)) {
              res = transformResponse(res);
            }
            resolve(res);
          }
        };
        xhr.send(payload);
      } catch (e) {
        return reject(e);
      }
    });
    raceArr.push(fetchPromise);
    return AxisPromise.race(raceArr);
  };

  ajax.setAbort = function(flag) {
    this.abort = !!flag;
  };

  ajax.get = function() {
    var options = paramsEntry(arguments);
    options.method = "get";
    return this.request(options);
  };

  ajax.post = function() {
    var options = paramsEntry(arguments);
    options.method = "post";
    return this.request(options);
  };

  ajax.put = function() {
    var options = paramsEntry(arguments);
    options.method = "put";
    return this.request(options);
  };

  ajax["delete"] = function() {
    var options = paramsEntry(arguments);
    options.method = "delete";
    return this.request(options);
  };

  ajax.options = function() {
    var options = paramsEntry(arguments);
    options.method = "options";
    return this.request(options);
  };

  ajax.all = function() {
    var args = assert.isArray(arguments)
      ? arguments
      : [].slice.call(arguments, 0);
    return AxisPromise.all(args);
  };

  ajax.race = function() {
    var args = assert.isArray(arguments)
      ? arguments
      : [].slice.call(arguments, 0);
    return AxisPromise.race(args);
  };

  return ajax;
});
