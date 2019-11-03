/*
 * @Author: gleeman
 * @Date: 2019-08-17 01:34:15
 * @LastEditors: gleeman
 * @LastEditTime: 2019-09-13 20:21:34
 * @Description: Number扩展方法
 */

such.define("number", ["assert", "error"], function(assert, error) {
  "use strict";
  
  var number = {
    // number是否在[start, end]区间
    inRange: function(number, start, end) {
      if (!assert.isNumber(number)) {
        error.type('"number" must be a number.');
      }
      start = Number(start) || 0;
      end = Number(end) || 0;
      var min = Math.min(start, end);
      var max = Math.max(start, end);
      return number === min || (min - number) * (max - number) < 0;
    },
    // 产生一个start到end的随机数
    random: function() {
      var args = Array.prototype.slice.call(arguments);
      var params = ["start", "end"];
      params.forEach(function(v, i) {
        if (!assert.isNumber(args[i])) {
          error.type('"' + v + '" must be a number.');
        }
      });
      var start = Math.min(args[0], args[0]);
      var end = Math.max(args[0], args[1]);
      return start + Math.random() * (end - start);
    },
    // 产生一个start到end的随机整数
    randomInt: function() {
      var args = Array.prototype.slice.call(arguments);
      var params = ["start", "end"];
      params.forEach(function(v, i) {
        if (!assert.isNumber(args[i])) {
          error.type('"' + v + '" must be a number.');
        }
      });
      var start = Math.min(args[0], args[0]);
      var end = Math.max(args[0], args[1]);
      return Math.floor(start + Math.random() * (end - start));
    }
  };

  return number;
});
