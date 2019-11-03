/*
 * @Author: gleeman
 * @Date: 2019-07-13 11:41:48
 * @LastEditors: gleeman
 * @LastEditTime: 2019-09-13 20:22:18
 * @Description: 数组扩展方法
 */

such.define("array", ["assert", "error"], function(assert, error) {
  "use strict";
  
  var array = {
    each: function(array, iterator) {
      array = Array.from(array);
      if (!assert.isFunction(iterator)) {
        error.error('"iterator" must be a function.');
      }
      for (var i = 0; i < array.length; i++) {
        var result = iterator(array[i], i, array);
        if (assert.isBoolean(result)) return result;
      }
    },
    // 数组分区, 返回新数组
    chunk: function(array, size) {
      if (!assert.isArray(array) || array.length === 0 || size < 1) {
        return [];
      }
      size = Math.floor(size);
      var ret = [];
      var len = array.length;
      var newLen = Math.ceil(len / size);
      for (var i = 0; i < newLen; i++) {
        var item = [];
        for (var j = 0; j < size; j++) {
          if (i * size + j < len) {
            item.push(array[i * size + j]);
          }
        }
        ret.push(item);
      }
      return ret;
    },
    // 过滤假值false、null、0、""、undefined、和NaN, 返回新数组
    compact: function(array) {
      if (!assert.isArray(array) || array.length === 0) {
        return [];
      }

      return array.filter(function(item) {
        return !!item;
      });
    },
    // 创建一个切片数组，去除array前面的size个元素
    drop: function(array, size) {
      if (!assert.isArray(array)) {
        error.error('"array" must be a array.');
      }
      size = Math.max(Math.floor(size), 0);
      var len = array.length;
      for (var i = 0; i < size && i < len; i++) {
        array.shift();
      }
      return array;
    },
    // 创建一个切片数组，去除array尾部的size个元素
    dropRight: function(array, size) {
      if (!assert.isArray(array)) {
        error.error('"array" must be a array.');
      }
      size = Math.max(Math.floor(size), 0);
      var len = array.length;
      for (var i = 0; i < size && i < len; i++) {
        array.pop();
      }
      return array;
    },
    // 创建一个切片数组，取得array前面的size个元素
    take: function(array, size) {
      if (!assert.isArray(array)) {
        error.error('"array" must be a array.');
      }
      return array.slice(0, Math.max(0, size));
    },
    // 创建一个切片数组，取得array尾部的size个元素
    takeRight: function(array, size) {
      if (!assert.isArray(array)) {
        error.error('"array" must be a array.');
      }
      var len = array.length;
      return array.slice(Math.max(0, len - size), len);
    },
    // 差集, 返回新数组
    difference: function() {
      var args = Array.prototype.slice.call(arguments);
      var array = args.shift();
      if (!assert.isArray(array)) {
        error.error('"array" must be a array.');
      }
      var excludes = [].concat.apply([], args);
      var ret = [];
      for (var i = 0; i < array.length; i++) {
        var item = array[i];
        var flag = excludes.some(function(exclude) {
          if (assert.isNaN(item, true) && assert.isNaN(exclude, true)) {
            return true;
          }
          return exclude === item;
        });
        if (!flag) ret.push(item);
      }
      return ret;
    },
    // 交集, 返回新数组
    intersection: function() {
      var args = Array.prototype.slice.call(arguments);
      var ret = [];
      var minLen = 0;
      var index = 0;
      if (!args.length) return ret;
      for (var i = 0; i < args.length; i++) {
        var _item = args[i];
        var _len = _item.length;
        if (!assert.isArray(args[i]) || !_item.length) {
          return ret;
        }
        if (_len < minLen) index = i;
        minLen = i === 0 ? _len : Math.min(minLen, _len);
      }

      var short = args[index];
      args.splice(index, 1);
      for (var j = 0; j < short.length; j++) {
        var item = short[j];
        var flag = args.every(function(arg) {
          return arg.includes(item);
        });
        if (flag && (!ret.length || !ret.includes(item))) {
          ret.push(item);
        }
      }

      return ret;
    },
    // 并集, 返回新数组
    union: function() {
      var args = Array.prototype.slice.call(arguments);
      var concat = [];
      args.forEach(function(item) {
        if (assert.isArray(item)) concat = concat.concat(item);
      });
      return this.unique(concat);
    },
    // 根据下标返回新数组
    pickAt: function(array, values) {
      if (!assert.isArray(array)) {
        error.error('"array" must be a array.');
      }
      if (!assert.isArray(values)) values = [values];
      var ret = [];
      var len = array.length;
      for (var i = 0; i < values.length; i++) {
        var item = values[i];
        if (assert.isNonnegativeInteger(item) && item < len) {
          ret.push(array[item]);
        }
      }
      return ret;
    },
    // 移除元素，返回原数组
    pull: function(array, values) {
      if (!assert.isArray(array)) {
        error.error('"array" must be a array.');
      }
      if (!assert.isArray(values)) values = [values];
      for (var i = array.length - 1; i >= 0; i--) {
        if (values.includes(array[i])) {
          array.splice(i, 1);
        }
      }
      return array;
    },
    // 根据下标删除元素，返回原数组
    pullAt: function(array, values) {
      if (!assert.isArray(array)) {
        error.error('"array" must be a array.');
      }
      var len = array.length;

      if (!assert.isArray(values)) values = [values];
      values = this.unique(values);
      values.sort(function(a, b) {
        return b - a;
      });

      values.forEach(function(item) {
        if (assert.isNonnegativeInteger(item) && item < len) {
          array.splice(item, 1);
        }
      });

      return array;
    },
    // 移除元素，返回新数组
    remove: function(array, values) {
      if (!assert.isArray(array)) {
        error.error('"array" must be a array.');
      }
      if (!assert.isArray(values)) values = [values];
      return this.difference(array, values);
    },
    // 根据下标删除元素，返回新数组
    removeAt: function(array, values) {
      if (!assert.isArray(array)) {
        error.error('"array" must be a array.');
      }
      if (!assert.isArray(values)) values = [values];
      var ret = [];
      for (var i = 0; i < array.length; i++) {
        if (!values.includes(i)) {
          ret.push(array[i]);
        }
      }
      return ret;
    },
    // 排序, 返回新数组
    sortBy: function(array, key, flag) {
      if (!assert.isArray(array)) {
        error.error('"array" must be a array.');
      }

      var clone = JSON.parse(JSON.stringify(array));
      if (!key) return clone;

      clone.sort(function(o1, o2) {
        var isNum = /^-?\d+$/,
          v1 = o1[key],
          v2 = o2[key];

        if (isNum.test(v1)) v1 = parseFloat(v1);
        if (isNum.test(v2)) v2 = parseFloat(v2);

        if (v1 && !v2) {
          return 1;
        } else if (!v1 && v2) {
          return -1;
        }

        if (v1 > v2) {
          return 1;
        } else if (v1 < v2) {
          return -1;
        } else {
          return 0;
        }
      });

      flag && clone.reverse(); //倒序
      return clone;
    },
    // 去重，返回新数组
    unique: function(array) {
      if (!assert.isArray(array)) {
        error.error('"array" must be a array.');
      }
      var ret = [];
      for (var i = 0; i < array.length; i++) {
        var item = array[i];
        if (!ret.length || !ret.includes(item)) {
          ret.push(item);
        }
      }
      return ret;
    }
  };

  return array;
});
