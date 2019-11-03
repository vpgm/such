/*
 * @Author: gleeman
 * @Date: 2019-08-17 01:34:15
 * @LastEditors: gleeman
 * @LastEditTime: 2019-11-02 14:32:13
 * @Description: ajax
 */

such.define("ajax", ["assert", "string", "axis-promise"], function(
  assert,
  string,
  AxisPromise
) {
  "use strict";

  var rejectType = {
    method: '"method" must be a string',
    url: '"method" must be a string',
    data: '"method" must be a string or a plainObject',
    headers: '"headers" must be a plainObject',
    NOT_SUPPORT: "the browser does not support XHR.",
    TIMEOUT: "the request was timed out.",
    ABORT: "abort request.",
    NET_ERROR: "network request failed."
  };

  var ajax = function(method, url, data, headers) {
    return new AxisPromise(function(resolve, reject) {
      if (!assert.isString(method)) {
        reject(rejectType.method);
      }
      if (!assert.isString(url)) {
        reject(rejectType.url);
      }
      data = data || {};
      headers = headers || {};
      if (!assert.isString(url) && !assert.isPlainObject(data)) {
        reject(rejectType.data);
      }
      if (!assert.isPlainObject(headers)) {
        reject(rejectType.headers);
      }

      var xhr, payload;
      try {
        xhr = newXHR();
      } catch (e) {
        reject(rejectType.NOT_SUPPORT);
      }
      payload = string.toQueryString(data, true);

      method = (method && method.toUpperCase()) || "GET";
      if (method === "GET" && payload) {
        url += "?" + payload;
        payload = null;
      }

      xhr.open(method, url);

      var content_type = "application/x-www-form-urlencoded";
      for (var h in headers) {
        if (headers.hasOwnProperty(h)) {
          if (h.toLowerCase() === "content-type") content_type = headers[h];
          else xhr.setRequestHeader(h, headers[h]);
        }
      }
      xhr.setRequestHeader("Content-type", content_type);

      xhr.onerror = function() {
        reject(rejectType.NET_ERROR);
      };

      xhr.ontimeout = function() {
        reject(rejectType.TIMEOUT);
      };

      xhr.onabort = function() {
        ajax.abort = false;
        reject(rejectType.ABORT);
      };

      xhr.onreadystatechange = function() {
        if (ajax.abort) {
          xhr.abort();
        }
        if (xhr.readyState === 4) {
          var res = xhr.responseText;
          if (typeof res === "string") {
            try {
              res = JSON.parse(res);
            } catch (e) {}
          }
          resolve(res);
        }
      };

      xhr.send(payload);
    });
  };

  // 创建XHR请求
  function newXHR() {
    var xhr;
    if (window.XMLHttpRequest) {
      xhr = new XMLHttpRequest();
    } else if (window.ActiveXObject) {
      try {
        xhr = new ActiveXObject("Msxml2.XMLHTTP");
      } catch (e) {
        xhr = new ActiveXObject("Microsoft.XMLHTTP");
      }
    }
    return xhr;
  }

  // 快捷方式
  function ajaxlnk(method) {
    return function(url, data, headers) {
      return ajax(method, url, data, headers);
    };
  }

  ajax.get = ajaxlnk("GET");
  ajax.post = ajaxlnk("POST");
  ajax.put = ajaxlnk("PUT");
  ajax.del = ajaxlnk("DELETE");
  ajax.abort = false;

  return ajax;
});
