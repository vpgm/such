/*
 * @Author: gleeman
 * @Date: 2019-08-17 01:34:15
 * @LastEditors: gleeman
 * @LastEditTime: 2019-09-14 18:14:45
 * @Description:
 */

such.define("cookie", function() {
  "use strict";

  var cookie = {
    set: function(name, value, days) {
      if (!name || !value) return;
      days = parseFloat(days) || 1;
      var exp = new Date();
      exp.setTime(exp.getTime() + days * 24 * 60 * 60 * 1000);
      document.cookie =
        name +
        "=" +
        encodeURIComponent(value) +
        ";expires=" +
        exp.toUTCString();
    },
    get: function(name) {
      var arr = document.cookie.match(
        new RegExp("(^| )" + name + "=([^;]*)(;|$)")
      );
      if (arr != null) return decodeURIComponent(arr[2]);
      return null;
    },
    del: function(name) {
      var exp = new Date();
      exp.setTime(exp.getTime() - 1);
      var cval = this.get(name);
      if (!cval)
        document.cookie = name + "=" + cval + ";expires=" + exp.toUTCString();
    }
  };

  return cookie;
});
