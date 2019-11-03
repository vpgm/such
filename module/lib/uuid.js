/*
 * @Author: gleeman
 * @Date: 2019-07-13 11:42:03
 * @LastEditors: gleeman
 * @LastEditTime: 2019-09-13 20:22:55
 * @Description: uuid
 * @Todo: 位移运算
 */

such.define("uuid", ["assert"], function(assert) {
  "use strict";
  
  var util = {
    chars: "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ",
    randomChar: function(lower, upper) {
      (!assert.isInteger(lower) || lower < 1 || lower > 62) && (lower = 1);
      (!assert.isInteger(upper) || upper < 1 || upper > 62) && (upper = 62);
      upper < lower && (upper = lower);
      return this.chars.charAt(
        lower - 1 + Math.floor(Math.random() * (upper + 1 - lower))
      );
    },
    isUpper: function(char) {
      return /^[A-Z]$/.test(char);
    },
    isLower: function(char) {
      return /^[a-z]$/.test(char);
    },
    isFigure: function(char) {
      return /^[0-9]$/.test(char);
    },
    randomLower: function(char) {
      if (!assert.isString(char)) return this.randomChar(1, 62);
      return Math.random() >= 0.5 ? char.toLowerCase() : char;
    },
    randomUpper: function(char) {
      if (!assert.isString(char)) return this.randomChar(1, 62);
      return Math.random() >= 0.5 ? char.toUpperCase() : char;
    }
  };

  var uuid = {
    create: function(prefix, fmt, radix) {
      var format = "xxyyzzww-xxxx-yyyy-zzzz-wwwwxyzw";
      !assert.isString(prefix) && (prefix = "");
      assert.isString(fmt) && fmt && (format = fmt);
      var length = format.length;
      if (assert.isNumber(fmt)) {
        length = Math.ceil(fmt);
        length < 1 && (length = 1);
        format = "";
      }
      var formatArray = format.split("");
      for (var i = 0; i < length; i++) {
        var char = formatArray[i];
        if (char !== "-" && !util.isFigure(char)) {
          switch (char) {
            case "@":
              char = util.randomChar(1, Math.min(10, radix));
              break;
            case "$":
              char =
                radix > 36
                  ? util.randomChar(37, radix)
                  : util.randomChar(1, radix);
              break;
            default:
              char = util.randomChar(1, radix);
          }
          formatArray[i] = char;
        }
      }
      return prefix + formatArray.join("");
    },
    createByLowerCase: function(prefix, fmt) {
      return this.create(prefix, fmt, 36);
    },
    createByUpperCase: function(prefix, fmt) {
      return this.create(prefix, fmt, 62).toUpperCase();
    },
    createId: function(prefix) {
      !assert.isString(prefix) && (prefix = "");
      var str = new Date().getTime() + "";
      var arr = [util.randomUpper("i"), util.randomUpper("d")];
      for (var i = 0; i < str.length / 3; i++) {
        var num = Number(str.substring(3 * i, 3 * i + 3)) + 296;
        var quotient = Math.floor(num / 36);
        var remainder = num % 36;
        arr.push(
          util.randomUpper(quotient.toString(36)),
          util.randomUpper(remainder.toString(36))
        );
      }
      return (
        prefix +
        "xxyyzzww-xxxx-yyyy-zzzz-wwwwxyzw".replace(/[xyzw]/g, function(c) {
          var r = 0;
          if (arr.length) {
            r = arr[0];
            arr.splice(0, 1);
          } else {
            r = util.randomChar(1, 62);
          }
          return r;
        })
      );
    },
    createIdByLowerCase: function(prefix) {
      return this.createId(prefix).toLowerCase();
    },
    createIdByUpperCase: function(prefix) {
      return this.createId(prefix).toUpperCase();
    }
  };

  return uuid;
});
