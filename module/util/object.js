/*
 * @Author: gleeman
 * @Date: 2019-07-13 11:42:02
 * @LastEditors: gleeman
 * @LastEditTime: 2019-11-02 14:55:45
 * @Description: Object对象扩展方法
 */

such.define("object", ["assert", "error"], function(assert, error) {
  "use strict";
  
  var getPath = function(path) {
    return (
      (assert.isString(path) &&
        path.replace(/^\[([^\]]*)\]/, "$1").replace(/\[([^\]]*)\]/g, ".$1")) ||
      String(path)
    );
  };

  var object = {
    // 过滤假值，返回新对象
    compact: function(object) {
      var isPlainObject = assert.isPlainObject(object);
      var isArray = assert.isArray(object);
      if (!isPlainObject && !isArray) {
        error.error('"object" must be a plainObject or a array.');
      }
      if (isPlainObject) {
        var copy = this.shallowCopy({}, object);
        for (var key in copy) {
          if (copy.hasOwnProperty(key) && !copy[key]) {
            delete copy[key];
          }
        }
        return copy;
      } else {
        return object.filter(function(item) {
          return !!item;
        });
      }
    },
    // 是否存在属性
    has: function(object, path) {
      var arr = getPath(path).split(".");
      var temp = object;
      var key;
      try {
        while (arr.length) {
          key = arr.shift();
          if (key in temp) {
            temp = temp[key];
          } else {
            return false;
          }
        }
        if (arr.length === 0) return true;
      } catch (e) {}

      return false;
    },
    // 获取属性
    get: function(object, path) {
      var arr = getPath(path).split(".");
      var temp = object;
      var key;
      try {
        while (arr.length) {
          key = arr.shift();
          if (key in temp) {
            temp = temp[key];
          } else {
            return undefined;
          }
        }
        if (arr.length === 0) return temp;
      } catch (e) {}

      return undefined;
    },
    // 更新属性
    set: function() {
      var args = Array.prototype.slice.call(arguments);
      if (!assert.isObjectLike(args[0]) || args.length < 3) return;
      var arr = getPath(args[1]).split(".");
      var temp = args[0];
      var value = args[2];
      var key;
      while (arr.length > 1) {
        key = arr.shift();
        if (!assert.isObjectLike(temp[key])) {
          temp[key] = {};
        }
        temp = temp[key];
      }
      temp[arr.shift()] = value;
    },
    // 删除属性
    del: function(object, path) {
      if (!assert.isObjectLike(object)) {
        error.type('"object" must be a object.');
      }
      var arr = getPath(path).split(".");
      var temp = object;
      var key;
      while (arr.length > 1) {
        key = arr.shift();
        if (assert.isObjectLike(temp[key])) {
          temp = temp[key];
        } else {
          return;
        }
      }
      delete temp[arr.shift()];
    },
    // 获取多个属性值
    take: function(object, include) {
      if (!assert.isObjectLike(object)) {
        error.type('"object" must be a object.');
      }
      var ret = [];
      if (assert.isUndefined(include)) {
        return ret;
      }
      if (!assert.isArray(include)) {
        include = [include];
      }
      include.forEach(function(item) {
        var arr = getPath(item).split(".");
        var temp = object;
        var key;
        try {
          while (arr.length) {
            key = arr.shift();
            if (key in temp) {
              temp = temp[key];
            } else {
              return;
            }
          }
          if (arr.length === 0) ret.push(temp);
        } catch (e) {}
      });
      return ret;
    },
    // 删除多个属性
    drop: function(object, paths) {
      if (!assert.isObjectLike(object)) {
        error.type('"object" must be a object.');
      }
      if (assert.isUndefined(paths)) {
        return;
      }
      if (!assert.isArray(paths)) {
        paths = [paths];
      }
      paths.forEach(function(item) {
        var arr = getPath(item).split(".");
        var temp = object;
        var key;
        while (arr.length > 1) {
          key = arr.shift();
          if (assert.isObjectLike(temp[key])) {
            temp = temp[key];
          } else {
            return;
          }
        }
        delete temp[arr.shift()];
      });
    },
    // Object 遍历自身和继承的可枚举属性
    forIn: function(object, iterator) {
      if (!assert.isObjectLike(object)) {
        error.type('"object" must be a Object.');
      }
      if (!assert.isFunction(iterator)) {
        error.type('"iterator" must be a function.');
      }
      var result;
      for (var key in object) {
        result = iterator(object[key], key, object);
        if (assert.isBoolean(result)) {
          return result;
        }
      }
    },
    // Object 遍历自身的可枚举属性
    forOwn: function(object, iterator) {
      if (!assert.isObjectLike(object)) {
        error.type('"object" must be a Object.');
      }
      if (!assert.isFunction(iterator)) {
        error.type('"iterator" must be a function.');
      }
      var result;
      for (var key in object) {
        if (object.hasOwnProperty(key)) {
          result = iterator(object[key], key, object);
          if (assert.isBoolean(result)) {
            return result;
          }
        }
      }
    },
    // 对象迭代器
    each: function(object, iterator) {
      if (!assert.isFunction(iterator)) {
        error.type('"iterator" must be a function.');
      }
      var result;
      if (assert.isString(object)) {
        // String
        for (var i = 0; i < object.length; i++) {
          result = iterator(object.charAt(i), i, object);
          if (assert.isBoolean(result)) {
            return result;
          }
        }
      } else if (assert.isArray(object)) {
        // Array
        for (var j = 0; j < object.length; j++) {
          result = iterator(object[j], j, object);
          if (assert.isBoolean(result)) {
            return result;
          }
        }
      } else if (assert.isObjectLike(object)) {
        if (assert.isFunction(object.entries)) {
          // Set / Map / 其他具有iterator接口的对象
          var entries = object.entries();
          var it = entries.next();
          while (!it.done) {
            result = iterator(it.value[1], it.value[0], object);
            if (assert.isBoolean(result)) {
              return result;
            }
            it = entries.next();
          }
        } else {
          // isplainObject || isArrayLike || ...
          for (var key in object) {
            if (object.hasOwnProperty(key)) {
              result = iterator(object[key], key, object);
              if (assert.isBoolean(result)) {
                return result;
              }
            }
          }
        }
      }
    },
    // 返回最先被predicate判断为真值的元素value
    find: function(object, predicate) {
      if (!assert.isObjectLike(object)) {
        error.type('"object" must be a Object.');
      }
      if (!assert.isFunction(predicate)) {
        error.type('"predicate" must be a function.');
      }
      var result;
      for (var key in object) {
        if (object.hasOwnProperty(key)) {
          result = predicate(object[key], key, object);
          if (result) return object[key];
        }
      }
    },
    // 返回最先被predicate判断为真值的元素key
    findKey: function(object, predicate) {
      if (!assert.isObjectLike(object)) {
        error.type('"object" must be a Object.');
      }
      if (!assert.isFunction(predicate)) {
        error.type('"predicate" must be a function.');
      }
      var result;
      for (var key in object) {
        if (object.hasOwnProperty(key)) {
          result = predicate(key, object[key], object);
          if (result) return key;
        }
      }
    },
    // 返回新对象，新对象的key和原对象一样
    map: function(object, iterator) {
      if (!assert.isObjectLike(object)) {
        error.type('"object" must be a Object.');
      }
      if (!assert.isFunction(iterator)) {
        error.type('"iterator" must be a function.');
      }
      var ret = {};
      for (var key in object) {
        if (object.hasOwnProperty(key)) {
          ret[key] = iterator(object[key], key, object);
        }
      }
      return ret;
    },
    // 返回新对象，新对象的key和原对象的key有映射关系
    mapKeys: function(object, iterator) {
      if (!assert.isObjectLike(object)) {
        error.type('"object" must be a Object.');
      }
      if (!assert.isFunction(iterator)) {
        error.type('"iterator" must be a function.');
      }
      var ret = {};
      var newKey;
      for (var key in object) {
        if (object.hasOwnProperty(key)) {
          newKey = iterator(key, object[key], object);
          ret[newKey] = object[key];
        }
      }
      return ret;
    },
    // 返回被predicate判断为真值的元素value组成的数组
    filter: function(object, predicate) {
      if (!assert.isObjectLike(object)) {
        error.type('"object" must be a Object.');
      }
      if (!assert.isFunction(predicate)) {
        error.type('"predicate" must be a function.');
      }
      var ret = [];
      var result;
      for (var key in object) {
        if (object.hasOwnProperty(key)) {
          result = predicate(object[key], key, object);
          if (result) ret.push(object[key]);
        }
      }
      return ret;
    },
    // 返回被predicate判断为真值的元素key组成的数组
    filterKeys: function(object, predicate) {
      if (!assert.isObjectLike(object)) {
        error.type('"object" must be a Object.');
      }
      if (!assert.isFunction(predicate)) {
        error.type('"predicate" must be a function.');
      }
      var ret = [];
      var result;
      for (var key in object) {
        if (object.hasOwnProperty(key)) {
          result = predicate(key, object[key], object);
          if (result) ret.push(key);
        }
      }
      return ret;
    },
    // 当所有元素被predicate判断为真值则返回true
    every: function(object, predicate) {
      if (!assert.isObjectLike(object)) {
        error.type('"object" must be a Object.');
      }
      if (!assert.isFunction(predicate)) {
        error.type('"predicate" must be a function.');
      }
      var result;
      for (var key in object) {
        if (object.hasOwnProperty(key)) {
          result = predicate(object[key], key, object);
          if (!result) return false;
        }
      }
      return true;
    },
    // 当某个元素被predicate判断为真值则返回true
    some: function(object, predicate) {
      if (!assert.isObjectLike(object)) {
        error.type('"object" must be a Object.');
      }
      if (!assert.isFunction(predicate)) {
        error.type('"predicate" must be a function.');
      }
      var result;
      for (var key in object) {
        if (object.hasOwnProperty(key)) {
          result = predicate(object[key], key, object);
          if (result) return true;
        }
      }
      return false;
    },
    // 将对象转化成[{ key：path, value：value }]数组
    toArray: function(object, path, array) {
      if (!assert.isObjectLike(object)) return [];
      if (!assert.isString(path) || !path) path = "";
      if (!assert.isArray(array) || !array) array = [];
      var self = this;
      self.each(object, function(value, key) {
        var newpath = path ? path + "[" + key + "]" : key;
        if (assert.isObjectLike(value)) {
          self.toArray(value, newpath, array);
        } else {
          array.push({
            key: newpath,
            value: value
          });
        }
      });
      return array;
    },
    // 浅拷贝
    shallowCopy: function(target) {
      var self = this;
      if (!assert.isObjectLike(target) && !assert.isFunction(target)) {
        target = {};
      }
      var args = Array.prototype.slice.call(arguments).slice(1);
      args.forEach(function(item) {
        var isPlainObject = assert.isPlainObject(item);
        var isArray = assert.isArray(item);
        if (isPlainObject || isArray) {
          self.each(item, function(value, key) {
            if (value !== undefined) {
              target[key] = value;
            }
          });
        }
      });
      return target;
    },
    // 深拷贝
    deepCopy: function(target) {
      var self = this;
      if (!assert.isObjectLike(target) && !assert.isFunction(target)) {
        target = {};
      }
      var args = Array.prototype.slice.call(arguments).slice(1);
      args.forEach(function(item) {
        var isPlainObject = assert.isPlainObject(item);
        var isArray = assert.isArray(item);
        if (isPlainObject || isArray) {
          self.each(item, function(value, key) {
            if (assert.isPlainObject(value)) {
              if (!target[key]) target[key] = {};
              target[key] = self.deepCopy(target[key], value);
            } else if (assert.isArray(value)) {
              if (!target[key]) target[key] = [];
              target[key] = self.deepCopy(target[key], value);
            } else {
              if (value !== undefined) {
                target[key] = value;
              }
            }
          });
        }
      });
      return target;
    }
  };

  return object;
});
