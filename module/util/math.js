/*
 * @Author: gleeman
 * @Date: 2019-08-17 01:34:15
 * @LastEditors: gleeman
 * @LastEditTime: 2019-09-13 20:21:39
 * @Description: math计算方法扩展
 */

such.define("math", ["assert", "error"], function(assert, error) {
  "use strict";
  
  var math = {
    // 精确计算加法
    add: function(arg1, arg2) {
      var r1, r2, m;
      try {
        r1 = arg1.toString().split(".")[1].length;
      } catch (e) {
        r1 = 0;
      }
      try {
        r2 = arg2.toString().split(".")[1].length;
      } catch (e) {
        r2 = 0;
      }
      m = Math.pow(10, Math.max(r1, r2));
      return (arg1 * m + arg2 * m) / m;
    },
    // 精确计算减法
    minus: function(arg1, arg2) {
      return this.add(arg1, -arg2);
    },
    // 精确计算乘法
    multiply: function(arg1, arg2) {
      var m = 0,
        s1 = arg1.toString(),
        s2 = arg2.toString();
      try {
        m += s1.split(".")[1].length;
      } catch (e) {}
      try {
        m += s2.split(".")[1].length;
      } catch (e) {}
      return (
        (Number(s1.replace(".", "")) * Number(s2.replace(".", ""))) /
        Math.pow(10, m)
      );
    },
    // 精确计算除法
    divide: function(arg1, arg2) {
      var t1 = 0,
        t2 = 0,
        r1,
        r2;
      try {
        t1 = arg1.toString().split(".")[1].length;
      } catch (e) {}
      try {
        t2 = arg2.toString().split(".")[1].length;
      } catch (e) {}
      with (Math) {
        r1 = Number(arg1.toString().replace(".", ""));
        r2 = Number(arg2.toString().replace(".", ""));
        return (r1 / r2) * pow(10, t2 - t1);
      }
    },
    // 乘方/开方
    pow: function(m, n) {
      return Math.pow(Number(m), Number(n));
    },
    // 阶乘
    factorial: function(n) {
      n = parseInt(n);
      if (n < 0) {
        return NaN;
      }
      if (n === 0 || n === 1) {
        return 1;
      }
      return n * this.factorial(n - 1);
    },
    // 斐波那契数列
    fibonacci: function(n, ac1, ac2) {
      n = parseInt(n);
      !ac1 && (ac1 = 1);
      !ac2 && (ac2 = 1);
      if (n <= 1) {
        return ac2;
      }
      return this.fibonacci(n - 1, ac2, ac1 + ac2);
    },
    // 返回迭代器返回值最大数对应的元素
    maxBy: function(array, iterator) {
      if (!assert.isArray(array)) {
        error.type('"array" must be a array.');
      }
      if (!assert.isFunction(iterator)) {
        error.type('"iterator" must be a function.');
      }
      var item, result, max, maxItem;
      for (var i = 0; i < array.length; i++) {
        item = array[i];
        result = iterator(item, i, array);
        if (i === 0) {
          max = result || 0;
          maxItem = item;
        } else if (result > max) {
          max = result;
          maxItem = item;
        }
      }
      return maxItem;
    },
    // 返回迭代器返回值最小数对应的元素
    minBy: function(array, iterator) {
      if (!assert.isArray(array)) {
        error.type('"array" must be a array.');
      }
      if (!assert.isFunction(iterator)) {
        error.type('"iterator" must be a function.');
      }
      var item, result, min, minItem;
      for (var i = 0; i < array.length; i++) {
        item = array[i];
        result = iterator(item, i, array);
        if (i === 0) {
          min = result || 0;
          minItem = item;
        } else if (result < min) {
          min = result;
          minItem = item;
        }
      }
      return minItem;
    },
    // 求平均数
    average: function() {
      var args = [].concat.apply([], Array.prototype.slice.call(arguments));
      var len = args.length;
      var self = this;
      var sum = 0;
      if (len === 0) {
        return NaN;
      }
      args.forEach(function(item) {
        sum = self.add(item, sum);
      });
      return sum / len;
    },
    averageBy: function(array, iterator) {
      if (!assert.isArray(array)) {
        error.type('"array" must be a array.');
      }
      if (!assert.isFunction(iterator)) {
        error.type('"iterator" must be a function.');
      }
      var self = this;
      var len = array.length;
      var sum = 0;
      if (len === 0) {
        return NaN;
      }
      array.forEach(function(item, idx) {
        sum = self.add(iterator(item, idx, array), sum);
      });
      return sum / len;
    },
    // 求和
    sum: function() {
      var args = [].concat.apply([], Array.prototype.slice.call(arguments));
      var self = this;
      var len = args.length;
      var sum = 0;
      if (len === 0) {
        return NaN;
      }
      args.forEach(function(item) {
        sum = self.add(item, sum);
      });
      return sum;
    },
    sumBy: function(array, iterator) {
      if (!assert.isArray(array)) {
        error.type('"array" must be a array.');
      }
      if (!assert.isFunction(iterator)) {
        error.type('"iterator" must be a function.');
      }
      var self = this;
      var len = array.length;
      var sum = 0;
      if (len === 0) {
        return NaN;
      }
      array.forEach(function(item, idx) {
        sum = self.add(iterator(item, idx, array), sum);
      });
      return sum;
    },
    // 计算式注入变量
    compute: function(express, data) {
      if (!assert.isString(express)) {
        return Number(express);
      }
      var result;
      express = express.replace(/\{\{([^\{\}]*)\}\}/g, function(_, match) {
        result = "";
        try {
          result = new Function(
            "data",
            "with(data) { return (" + match + ") }"
          )(data);
        } catch (e) {
          result = "";
        }
        return result === undefined || result === null ? "" : result;
      });
      try {
        result = eval(express);
      } catch (e) {
        result = NaN;
      }
      return result;
    }
  };

  return math;
});
