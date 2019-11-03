/*
 * @Author: gleeman
 * @Date: 2019-08-10 12:58:58
 * @LastEditors: gleeman
 * @LastEditTime: 2019-08-13 23:42:59
 * @Description: 错误处理
 */
such.define("error", function() {
  "use strict";
  
  var error = {
    info: function(msg) {
      window.console && console.info && console.info(msg);
    },
    warn: function(msg) {
      window.console && console.warn && console.warn(msg);
    },
    error: function(msg) {
      throw new Error(msg);
    },
    type: function(msg) {
      throw new TypeError(msg);
    },
    range: function(msg) {
      throw new RangeError(msg);
    }
  };

  return error;
});
