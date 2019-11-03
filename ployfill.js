/*
 * @Author: gleeman
 * @Date: 2019-07-14 22:43:01
 * @LastEditors: gleeman
 * @LastEditTime: 2019-11-02 21:33:47
 * @Description: ployfill
 */

!(function() {
  // Object

  var maxSafeInteger = Math.pow(2, 53) - 1;
  var util = {
    typeOf: function() {
      if (arguments.length > 2) {
        throw new Error("it accept two paramters at most");
      }
      if (arguments.length === 2 && typeof arguments[1] !== "string") {
        throw new Error("the second paramter must be a string");
      }
      var type = Object.prototype.toString
        .call(arguments[0])
        .toLowerCase()
        .replace(/^\[object\s(.*)\]$/, "$1");
      if (arguments.length <= 1) {
        return type;
      } else if (arguments.length === 2) {
        return type === arguments[1];
      }
    },
    isPlainObject: function(value) {
      return this.typeOf(value, "object");
    },
    isArray: function(value) {
      return this.typeOf(value, "array");
    },
    isString: function(value) {
      return typeof value === "string";
    },
    isNumber: function(value) {
      return typeof value === "number";
    },
    isNaN: function(value, bool) {
      return (!bool || this.isNumber(value)) && !(value >= 0) && !(value < 0);
    },
    isFunction: function(value) {
      return typeof value === "function" || this.typeOf(value, "function");
    },
    toInteger: function(value) {
      var number = Number(value);
      if (isNaN(number)) {
        return 0;
      }
      if (number === 0 || !isFinite(number)) {
        return number;
      }
      return (number > 0 ? 1 : -1) * Math.floor(Math.abs(number));
    },
    toLength: function(value) {
      var len = this.toInteger(value);
      return Math.min(Math.max(len, 0), maxSafeInteger);
    },
    toString: function(value) {
      return value === undefined ? "" : String(value);
    },
    toIterator: function(value) {
      if (value.size > 0 && value.values) {
        // Set/Map
        var values = value.values();
        var it = values.next();
        var o = [];
        while (!it.done) {
          o.push(it.value);
          it = values.next();
        }
        return o;
      } else if (this.isString(value)) {
        // String
        var o = [];
        for (var i = 0; i < value.length; i++) {
          o.push(value.charAt(i));
        }
        return o;
      }
      // Array|ArrayLike
      return Object(value);
    }
  };

  // 分配来源对象的可枚举属性到目标对象上。 来源对象的应用规则是从左到右，随后的下一个对象的属性会覆盖上一个对象的属性。
  Object.assign =
    Object.assign ||
    function() {
      var args = Array.prototype.slice.call(arguments);
      var target = args.shift();
      if (!util.isPlainObject(target)) target = {};
      if (args.length) {
        for (var i = 0; i < args.length; i++) {
          var item = args[i];
          if (util.isPlainObject(item)) {
            for (var key in item) {
              // 是否可枚举
              if (item.propertyIsEnumerable(key)) {
                target[key] = item[key];
              }
            }
          }
        }
      }
      return target;
    };

  // 创建一个继承prototype 的对象。 如果提供了prototype，它的可枚举属性会被分配到创建的对象上。
  // new: 执行构造函数生成实例化对象
  // Object.create: 将实例化的原型对象赋给新生成的对象，实例对象=>实例对象
  Object.create =
    Object.create ||
    function(proto, propertiesObject) {
      function Fn() {}

      if (util.isPlainObject(proto)) {
        Fn.prototype = proto;
      }

      var fn = new Fn();

      if (util.isPlainObject(propertiesObject)) {
        // Object.defineProperties(fn, propertiesObject);
        // 兼容写法
        for (var key in propertiesObject) {
          if (propertiesObject.hasOwnProperty(key)) {
            var property = propertiesObject[key];
            fn[key] = (property.get && property.get()) || property.value;
          }
        }
      }

      return fn;
    };

  // 返回给定对象自身可枚举属性的[key, value]数组 (array/object/string)
  Object.entries =
    Object.entries ||
    function(obj) {
      var ownProps = Object.keys(obj),
        i = ownProps.length,
        resArray = new Array(i);
      while (i--) resArray[i] = [ownProps[i], obj[ownProps[i]]];

      return resArray;
    };

  // Object.fromEntries()方法是Object.entries()的逆操作，用于将一个键值对数组转为对象
  Object.fromEntries =
    Object.fromEntries ||
    function(array) {
      var ret = {};

      if (util.isArray(array)) {
        for (var i = 0; i < array.length; i++) {
          var item = array[i];
          if (util.isArray(item)) {
            ret[item[0]] = item[1];
          }
        }
      }

      return ret;
    };

  // 返回一个包含所有给定对象自身可枚举属性名称的数组
  Object.keys =
    Object.keys ||
    (function() {
      var hasOwnProperty = Object.prototype.hasOwnProperty,
        hasDontEnumBug = !{ toString: null }.propertyIsEnumerable("toString"),
        dontEnums = [
          "toString",
          "toLocaleString",
          "valueOf",
          "hasOwnProperty",
          "isPrototypeOf",
          "propertyIsEnumerable",
          "constructor"
        ],
        dontEnumsLength = dontEnums.length;

      return function(obj) {
        if (
          (typeof obj !== "object" && typeof obj !== "function") ||
          obj === null
        )
          throw new TypeError("Object.keys called on non-object");

        var result = [];

        for (var prop in obj) {
          if (hasOwnProperty.call(obj, prop)) result.push(prop);
        }

        if (hasDontEnumBug) {
          for (var i = 0; i < dontEnumsLength; i++) {
            if (hasOwnProperty.call(obj, dontEnums[i]))
              result.push(dontEnums[i]);
          }
        }
        return result;
      };
    })();

  // 返回给定对象自身可枚举值的数组
  Object.values =
    Object.values ||
    function(obj) {
      if (obj !== Object(obj))
        throw new TypeError("Object.values called on a non-object");
      var val = [],
        key;
      for (key in obj) {
        if (Object.prototype.hasOwnProperty.call(obj, key)) {
          val.push(obj[key]);
        }
      }
      return val;
    };

  // 比较两个值是否相同。所有NaN值都相等（这与==和===不同）
  Object.is =
    Object.is ||
    function(x, y) {
      if (x === y) {
        // +0 != -0
        return x !== 0 || 1 / x === 1 / y;
      } else {
        // NaN == NaN
        return x !== x && y !== y;
      }
    };

  // 返回指定对象的原型对象 todo!!
  // Object.getPrototypeOf =
  //   Object.getPrototypeOf ||
  //   function(obj) {
  //     return !obj
  //       ? null
  //       : "__proto__" in obj
  //       ? obj.__proto__
  //       : obj.constructor.prototype;
  //   };

  // 设置对象的原型（即内部[[Prototype]]属性）
  Object.setPrototypeOf =
    Object.setPrototypeOf ||
    function(obj, proto) {
      obj.__proto__ = proto;
      return obj;
    };

  // 给对象添加一个属性并指定该属性的配置 ie9
  // Object.defineProperty

  // 给对象添加多个属性并分别指定它们的配置 ie9
  // Object.defineProperties
  // function defineProperties(obj, properties) {
  //   function convertToDescriptor(desc) {
  //     function hasProperty(obj, prop) {
  //       return Object.prototype.hasOwnProperty.call(obj, prop);
  //     }

  //     function isCallable(v) {
  //       return typeof v === 'function';
  //     }

  //     if (typeof desc !== 'object' || desc === null)
  //       throw new TypeError('bad desc');

  //     var d = {};

  //     if (hasProperty(desc, 'enumerable'))
  //       d.enumerable = !!desc.enumerable;
  //     if (hasProperty(desc, 'configurable'))
  //       d.configurable = !!desc.configurable;
  //     if (hasProperty(desc, 'value'))
  //       d.value = desc.value;
  //     if (hasProperty(desc, 'writable'))
  //       d.writable = !!desc.writable;
  //     if (hasProperty(desc, 'get')) {
  //       var g = desc.get;

  //       if (!isCallable(g) && typeof g !== 'undefined')
  //         throw new TypeError('bad get');
  //       d.get = g;
  //     }
  //     if (hasProperty(desc, 'set')) {
  //       var s = desc.set;
  //       if (!isCallable(s) && typeof s !== 'undefined')
  //         throw new TypeError('bad set');
  //       d.set = s;
  //     }

  //     if (('get' in d || 'set' in d) && ('value' in d || 'writable' in d))
  //       throw new TypeError('identity-confused descriptor');

  //     return d;
  //   }

  //   if (typeof obj !== 'object' || obj === null)
  //     throw new TypeError('bad obj');

  //   properties = Object(properties);

  //   var keys = Object.keys(properties);
  //   var descs = [];

  //   for (var i = 0; i < keys.length; i++)
  //     descs.push([keys[i], convertToDescriptor(properties[keys[i]])]);

  //   for (var i = 0; i < descs.length; i++)
  //     Object.defineProperty(obj, descs[i][0], descs[i][1]);

  //   return obj;
  // }

  // 冻结对象：其他代码不能删除或更改任何属性 ie9
  // Object.freeze

  // 返回对象指定的属性配置 ie8
  // Object.getOwnPropertyDescriptor

  // 用来获取一个对象的所有自身属性的描述符 chrome54 ie&&not
  // Object.getOwnPropertyDescriptors

  // 返回一个数组，它包含了指定对象所有的可枚举或不可枚举的属性名 ie9
  // Object.getOwnPropertyNames

  // 返回一个数组，它包含了指定对象自身所有的符号属性 chrome38 ie&&not
  // Object.getOwnPropertySymbols

  // 判断对象是否可扩展 ie9
  // Object.isExtensible

  // 判断对象是否已经冻结 ie9
  // Object.isFrozen

  // 判断对象是否已经密封 ie9
  // Object.isSealed

  // 防止对象的任何扩展 ie9
  // Object.preventExtensions

  // 防止其他代码删除对象的属性 ie9
  // Object.seal

  // 返回一个布尔值，表示某个对象是否含有指定的属性，而且此属性非原型链继承的 all
  // Object.prototype.hasOwnProperty

  // 返回一个布尔值，表示指定的对象是否在本对象的原型链中 all
  // Object.prototype.isPrototypeOf

  // 判断指定属性是否可枚举 all
  // Object.prototype.propertyIsEnumerable

  // 直接调用toString()方法 all
  // Object.prototype.toLocaleString

  // 返回对象的字符串表示 all
  // Object.prototype.toString

  // 返回指定对象的原始值 all
  // Object.prototype.valueOf

  // Array

  // 从类数组对象或者可迭代对象中创建一个新的数组实例
  Array.from =
    Array.from ||
    function(arrayLike) {
      var C = this;
      var items = util.toIterator(arrayLike);

      if (arrayLike == null) {
        throw new TypeError(
          "Array.from requires an array-like object - not null or undefined"
        );
      }

      var mapFn = arguments.length > 1 ? arguments[1] : void undefined;
      var T;
      if (typeof mapFn !== "undefined") {
        if (!util.isFunction(mapFn)) {
          throw new TypeError(
            "Array.from: when provided, the second argument must be a function"
          );
        }

        if (arguments.length > 2) {
          T = arguments[2];
        }
      }

      var len = util.toLength(items.length);
      var A = util.isFunction(C) ? Object(new C(len)) : new Array(len);
      var k = 0;
      var kValue;
      while (k < len) {
        kValue = items[k];
        if (mapFn) {
          A[k] =
            typeof T === "undefined"
              ? mapFn(kValue, k)
              : mapFn.call(T, kValue, k);
        } else {
          A[k] = kValue;
        }
        k += 1;
      }
      A.length = len;
      return A;
    };

  // 用来判断某个变量是否是一个数组对象
  Array.isArray =
    Array.isArray ||
    function(array) {
      return util.isArray(array);
    };

  // 根据一组参数来创建新的数组实例，支持任意的参数数量和类型
  Array.of =
    Array.of ||
    function() {
      return Array.prototype.slice.call(arguments);
    };

  // 修改器方法：下面的这些方法会改变调用它们的对象自身的值
  // 在数组内部，将一段元素序列拷贝到另一段元素序列上，覆盖原有的值
  Array.prototype.copyWithin =
    Array.prototype.copyWithin ||
    function(target, start /*, end*/) {
      if (this == null) {
        throw new TypeError("this is null or not defined");
      }

      var O = Object(this);
      var len = O.length >>> 0;
      var relativeTarget = target >> 0;
      var to =
        relativeTarget < 0
          ? Math.max(len + relativeTarget, 0)
          : Math.min(relativeTarget, len);
      var relativeStart = start >> 0;
      var from =
        relativeStart < 0
          ? Math.max(len + relativeStart, 0)
          : Math.min(relativeStart, len);
      var end = arguments[2];
      var relativeEnd = end === undefined ? len : end >> 0;
      var final =
        relativeEnd < 0
          ? Math.max(len + relativeEnd, 0)
          : Math.min(relativeEnd, len);
      var count = Math.min(final - from, len - to);
      var direction = 1;

      if (from < to && to < from + count) {
        direction = -1;
        from += count - 1;
        to += count - 1;
      }

      while (count > 0) {
        if (from in O) {
          O[to] = O[from];
        } else {
          delete O[to];
        }

        from += direction;
        to += direction;
        count--;
      }

      return O;
    };

  // 将数组中指定区间的所有元素的值，都替换成某个固定的值
  Array.prototype.fill =
    Array.prototype.fill ||
    function(value) {
      if (this == null) {
        throw new TypeError("this is null or not defined");
      }

      var O = Object(this);
      var len = O.length >>> 0;
      var start = arguments[1];
      var relativeStart = start >> 0;
      var k =
        relativeStart < 0
          ? Math.max(len + relativeStart, 0)
          : Math.min(relativeStart, len);
      var end = arguments[2];
      var relativeEnd = end === undefined ? len : end >> 0;
      var final =
        relativeEnd < 0
          ? Math.max(len + relativeEnd, 0)
          : Math.min(relativeEnd, len);

      while (k < final) {
        O[k] = value;
        k++;
      }

      return O;
    };

  // 删除数组的最后一个元素，并返回这个元素
  Array.prototype.pop =
    Array.prototype.pop ||
    function() {
      var self = this;
      var last = self[self.length - 1];
      self.length = Math.max(self.length - 1, 0);
      return last;
    };

  // 在数组的末尾增加一个或多个元素，并返回数组的新长度
  Array.prototype.push =
    Array.prototype.push ||
    function() {
      var self = this;
      var l = self.length;
      var args = arguments;
      var len = args.length;
      var i = 0;
      self.length = l + len;
      for (; i < len; i++) {
        self[l + i] = args[i];
      }
      return l + len;
    };

  // 颠倒数组中元素的排列顺序，即原先的第一个变为最后一个，原先的最后一个变为第一个
  Array.prototype.reverse =
    Array.prototype.reverse ||
    function() {
      var self = this;
      var len = self.length;
      var l = Math.floor(len / 2);
      for (var i = 0; i < l; i++) {
        var start = self[i];
        var end = self[len - i - 1];
        self[i] = end;
        self[len - i - 1] = start;
      }
      return self;
    };

  // 删除数组的第一个元素，并返回这个元素
  Array.prototype.shift =
    Array.prototype.shift ||
    function() {
      var self = this;
      var first = self[0];
      var len = self.length;
      for (var i = 1; i < len; i++) {
        self[i - 1] = self[i];
      }
      self.length = Math.max(len - 1, 0);
      return first;
    };

  // 对数组元素进行排序，并返回当前数组(归并排序)
  // Todo: 优化
  Array.prototype.sort =
    Array.prototype.sort ||
    function() {
      var comparefn = arguments[0];
      var self = this;

      if (comparefn === undefined || self.length <= 1) return self;
      if (!util.isFunction(comparefn)) {
        throw new Error("the first arguments must be a function");
      }

      var wrappedCompareFn = comparefn;
      comparefn = function(x, y) {
        if (x === undefined) {
          if (y === undefined) return 0;
          return 1;
        }
        if (y === undefined || util.isNaN(x)) return -1;
        if (util.isNaN(y)) return 1;
        var v = Number(wrappedCompareFn(x, y));
        return v !== v ? -1 : v;
      };

      var mergeSortRec = function(array) {
        var length = array.length;

        if (length === 1) {
          return array;
        }

        var mid = Math.floor(length / 2),
          left = array.slice(0, mid),
          right = array.slice(mid, length);

        return merge(mergeSortRec(left), mergeSortRec(right), comparefn);
      };

      var merge = function(left, right, comparefn) {
        var result = [],
          il = 0,
          ir = 0;

        while (il < left.length && ir < right.length) {
          if (comparefn(left[il], right[ir]) < 0) {
            result.push(left[il++]);
          } else {
            result.push(right[ir++]);
          }
        }

        while (il < left.length) {
          result.push(left[il++]);
        }

        while (ir < right.length) {
          result.push(right[ir++]);
        }

        return result;
      };

      var ret = mergeSortRec(self);
      for (var i = 0; i < ret.length; i++) {
        self[i] = ret[i];
      }

      return self;
    };

  // 在任意的位置给数组添加或删除任意个元素
  Array.prototype.splice =
    Array.prototype.splice ||
    function() {
      var self = this;
      var result = [];
      var index = 0;
      var num = self.length;
      if (!self.length || !arguments.length) return result;
      if (typeof arguments[0] === "number") {
        index = arguments[0];
        // 修正删除元素起始下标
        if (index < 0) index = index + self.length;
        if (index < 0) index = 0;
        if (index > self.length) index = self.length;
        if (arguments.length >= 2) {
          if (typeof arguments[1] === "number") {
            num = arguments[1];
            // 修正删除元素数量
            if (num < 0) num = 0;
            if (num > self.length) num = self.length;
            if (num + index > self.length) num = self.length - index;
          } else {
            return result;
          }
        } else {
          // 修正删除元素数量
          if (num + index > self.length) num = self.length - index;
        }
      } else {
        return result;
      }
      // 待新增元素
      var otherParams = Array.prototype.slice.call(arguments, 2);
      var len = otherParams.length;
      // 待删除元素
      for (var i = num - 1; i >= 0; i--) {
        result.unshift(self[index + i]);
      }
      // 删除元素和新增元素操作
      if (len > num) {
        // 数组右移
        for (var i = self.length - 1; i >= index; i--) {
          self[i + len - num] = self[i];
        }
      } else if (len < num) {
        // 数组左移
        for (var i = index; i <= self.length - 1; i++) {
          if (i < self.length + len - num) {
            self[i] = self[i + num - len];
          } else {
            break;
          }
        }
        // 更新数组长度，删除多余元素
        self.length = self.length - num + len;
      }
      for (var i = len + index - 1; i >= index; i--) {
        self[i] = otherParams[i - index];
      }
      return result;
    };

  // 在数组的开头增加一个或多个元素，并返回数组的新长度
  Array.prototype.unshift =
    Array.prototype.unshift ||
    function() {
      var self = this;
      var len = self.length;
      var args = arguments;
      var newLen = args.length;

      var num = 0;
      var newArr = [];
      for (num in args) {
        if (num < newLen) {
          newArr.push(args[num++]);
        }
      }

      var totalLen = len + newLen;
      if (totalLen > len) {
        self.length = totalLen;
        for (var i = totalLen - 1; i >= 0; i--) {
          if (i >= newLen) {
            self[i] = self[i - newLen];
          } else {
            self[i] = newArr[i];
          }
        }
      }

      return totalLen;
    };

  // 访问方法：下面的这些方法绝对不会改变调用它们的对象的值，只会返回一个新的数组或者返回一个其它的期望值
  // 返回一个由当前数组和其它若干个数组或者若干个非数组值组合而成的新数组
  Array.prototype.concat =
    Array.prototype.concat ||
    function() {
      var self = this;
      var result = [];
      for (var i = 0; i < self.length; i++) {
        result.push(self[i]);
      }

      var args = arguments;
      var newLen = args.length;
      var num = 0;
      var params = [];
      for (num in args) {
        if (num < newLen) {
          params.push(args[num++]);
        }
      }

      if (!params.length) {
        return result;
      } else {
        for (var i = 0; i < params.length; i++) {
          var v = params[i];
          if (util.isArray(v)) {
            for (var j = 0; j < v.length; j++) {
              result.push(v[j]);
            }
          } else {
            result.push(v);
          }
        }
      }

      return result;
    };

  // Array.prototype.flat()用于将嵌套的数组“拉平”，变成一维的数组。flat()默认只会“拉平”一层，如果想要“拉平”多层的嵌套数组，可以将flat()方法的参数写成一个整数，表示想要拉平的层数，默认为1
  Array.prototype.flat =
    Array.prototype.flat ||
    function() {
      var self = this;
      var arg = arguments[0];
      var flatDeep = Number(arg === undefined ? 1 : arg);
      if (util.isNaN(flatDeep) || flatDeep < 1) return self;
      flatDeep = Math.floor(flatDeep);
      var ret = self;
      var flatAll = false;
      while (flatDeep > 0 && !flatAll) {
        ret = Array.prototype.concat.apply([], ret);
        flatAll = ret.every(function(item) {
          return !util.isArray(item);
        });
        flatDeep--;
      }
      return ret;
    };

  // flatMap()方法对原数组的每个成员执行一个函数（相当于执行Array.prototype.map()），然后对返回值组成的数组执行flat()方法。该方法返回一个新数组，不改变原数组。flatMap()只能展开一层数组。
  Array.prototype.flatMap =
    Array.prototype.flatMap ||
    function() {
      var self = this;
      var mapper = arguments[0];
      if (!util.isFunction(mapper)) {
        throw new TypeError("flatMap mapper function is not callable");
      }
      var ret = [];
      for (var i = 0; i < self.length; i++) {
        ret = ret.concat(mapper(self[i]));
      }
      return ret;
    };

  // 判断当前数组是否包含某指定的值，如果是返回true，否则返回false
  Array.prototype.includes =
    Array.prototype.includes ||
    function() {
      var self = this;
      var arg = arguments[0];
      var start = Number(arguments[1]) || 0;
      return self.slice(start).some(function(item) {
        return item === arg;
      });
    };

  // 连接所有数组元素组成一个字符串
  Array.prototype.join =
    Array.prototype.join ||
    function() {
      var self = this;
      var len = self.length;
      var ret = "";
      var join = util.toString(arguments[0]);
      for (var i = 0; i < len; i++) {
        var item = util.toString(self[i]);
        ret += i === len - 1 ? item : item + join;
      }
      return ret;
    };

  // 抽取当前数组中的一段元素组合成一个新数组
  Array.prototype.slice =
    Array.prototype.slice ||
    function() {
      var self = this;
      var result = [];
      var start = 0;
      var end = self.length;
      if (!self.length) return [];
      if (arguments.length && typeof arguments[0] === "number") {
        start = arguments[0];
        if (start < 0) start = start + self.length;
        if (arguments.length >= 2) {
          if (typeof arguments[1] === "number") {
            end = arguments[1];
            if (end < 0) end = end + self.length;
          } else {
            return result;
          }
        }
      } else {
        return result;
      }
      if (start >= end) {
        return [];
      } else {
        if (end <= 0 || start > self.length) {
          return [];
        } else {
          if (start < 0) start = 0;
          if (end > self.length) end = self.length;
          for (var i = start; i < end; i++) {
            result.push(self[i]);
          }
          return result;
        }
      }
    };

  // 返回数组中第一个与指定值相等的元素的索引，如果找不到这样的元素，则返回-1
  Array.prototype.indexOf =
    Array.prototype.indexOf ||
    function() {
      var target = arguments[0];
      var self = this;
      for (var i = 0; i < self.length; i++) {
        if (self[i] === target) return i;
      }
      return -1;
    };

  // 返回数组中最后一个（从右边数第一个）与指定值相等的元素的索引，如果找不到这样的元素，则返回-1
  Array.prototype.lastIndexOf =
    Array.prototype.lastIndexOf ||
    function() {
      var target = arguments[0];
      var self = this;
      for (var i = self.length - 1; i >= 0; i--) {
        if (self[i] === target) return i;
      }
      return -1;
    };

  // 迭代方法：在下面的众多遍历方法中，有很多方法都需要指定一个回调函数作为参数。在每一个数组元素都分别执行完回调函数之前，数组的length属性会被缓存在某个地方，所以，如果你在回调函数中为当前数组添加了新的元素，那么那些新添加的元素是不会被遍历到的。此外，如果在回调函数中对当前数组进行了其它修改，比如改变某个元素的值或者删掉某个元素，那么随后的遍历操作可能会受到未预期的影响。总之，不要尝试在遍历过程中对原数组进行任何修改，虽然规范对这样的操作进行了详细的定义，但为了可读性和可维护性，请不要这样做
  // 为数组中的每个元素执行一次回调函数
  Array.prototype.forEach =
    Array.prototype.forEach ||
    function(callback, thisArg) {
      var T, k;

      if (this == null) {
        throw new TypeError(" this is null or not defined");
      }

      var O = Object(this);
      var len = O.length >>> 0;

      if (typeof callback !== "function") {
        throw new TypeError(callback + " is not a function");
      }

      if (arguments.length > 1) {
        T = thisArg;
      }

      k = 0;
      while (k < len) {
        var kValue;
        if (k in O) {
          kValue = O[k];
          callback.call(T, kValue, k, O);
        }
        k++;
      }
    };

  // 返回一个数组迭代器对象，该迭代器会包含所有数组元素的键值对
  Array.prototype.entries =
    Array.prototype.entries ||
    function() {
      var self = this;
      var i = 0;
      var len = self.length;
      return {
        next: function() {
          var ret = {
            value: i >= len ? undefined : [i, self[i]],
            done: i >= len
          };
          i++;
          return ret;
        }
      };
    };

  // 如果数组中的每个元素都满足测试函数，则返回true，否则返回false
  Array.prototype.every =
    Array.prototype.every ||
    function(callbackfn, thisArg) {
      "use strict";
      var T, k;

      if (this == null) {
        throw new TypeError("this is null or not defined");
      }

      var O = Object(this);
      var len = O.length >>> 0;

      if (typeof callbackfn !== "function") {
        throw new TypeError();
      }

      if (arguments.length > 1) {
        T = thisArg;
      }

      k = 0;
      while (k < len) {
        var kValue;
        if (k in O) {
          kValue = O[k];
          var testResult = callbackfn.call(T, kValue, k, O);
          if (!testResult) {
            return false;
          }
        }
        k++;
      }
      return true;
    };

  // 如果数组中至少有一个元素满足测试函数，则返回true，否则返回false
  Array.prototype.some =
    Array.prototype.some ||
    function(fun /*, thisArg*/) {
      "use strict";

      if (this == null) {
        throw new TypeError("Array.prototype.some called on null or undefined");
      }

      if (typeof fun !== "function") {
        throw new TypeError();
      }

      var t = Object(this);
      var len = t.length >>> 0;

      var thisArg = arguments.length >= 2 ? arguments[1] : void 0;
      for (var i = 0; i < len; i++) {
        if (i in t && fun.call(thisArg, t[i], i, t)) {
          return true;
        }
      }

      return false;
    };

  // 将所有在过滤函数中返回true的数组元素放进一个新数组中并返回
  Array.prototype.filter =
    Array.prototype.filter ||
    function(func, thisArg) {
      "use strict";
      if (!((typeof func === "Function" || typeof func === "function") && this))
        throw new TypeError();

      var len = this.length >>> 0,
        res = new Array(len),
        t = this,
        c = 0,
        i = -1;
      if (thisArg === undefined) {
        while (++i !== len) {
          if (i in this) {
            if (func(t[i], i, t)) {
              res[c++] = t[i];
            }
          }
        }
      } else {
        while (++i !== len) {
          if (i in this) {
            if (func.call(thisArg, t[i], i, t)) {
              res[c++] = t[i];
            }
          }
        }
      }

      res.length = c;
      return res;
    };

  // 找到第一个满足测试函数的元素并返回那个元素的值，如果找不到，则返回undefined
  Array.prototype.find =
    Array.prototype.find ||
    function(predicate) {
      if (this == null) {
        throw new TypeError('"this" is null or not defined');
      }

      var o = Object(this);
      var len = o.length >>> 0;

      if (typeof predicate !== "function") {
        throw new TypeError("predicate must be a function");
      }

      var thisArg = arguments[1];
      var k = 0;
      while (k < len) {
        var kValue = o[k];
        if (predicate.call(thisArg, kValue, k, o)) {
          return kValue;
        }
        k++;
      }

      return undefined;
    };

  // 找到第一个满足测试函数的元素并返回那个元素的索引，如果找不到，则返回-1
  Array.prototype.findIndex =
    Array.prototype.findIndex ||
    function(predicate) {
      if (this == null) {
        throw new TypeError('"this" is null or not defined');
      }

      var o = Object(this);
      var len = o.length >>> 0;

      if (typeof predicate !== "function") {
        throw new TypeError("predicate must be a function");
      }

      var thisArg = arguments[1];
      var k = 0;
      while (k < len) {
        var kValue = o[k];
        if (predicate.call(thisArg, kValue, k, o)) {
          return k;
        }
        k++;
      }

      return -1;
    };

  // 返回一个数组迭代器对象，该迭代器会包含所有数组元素的键
  Array.prototype.keys =
    Array.prototype.keys ||
    function() {
      var self = this;
      var i = 0;
      var len = self.length;
      return {
        next: function() {
          var ret = {
            value: i >= len ? undefined : i,
            done: i >= len
          };
          i++;
          return ret;
        }
      };
    };

  // 返回一个由回调函数的返回值组成的新数组
  Array.prototype.map =
    Array.prototype.map ||
    function(callback, thisArg) {
      var T, A, k;

      if (this == null) {
        throw new TypeError(" this is null or not defined");
      }

      var O = Object(this);
      var len = O.length >>> 0;

      if (Object.prototype.toString.call(callback) != "[object Function]") {
        throw new TypeError(callback + " is not a function");
      }

      if (thisArg) {
        T = thisArg;
      }

      A = new Array(len);
      k = 0;
      while (k < len) {
        var kValue, mappedValue;
        if (k in O) {
          kValue = O[k];
          mappedValue = callback.call(T, kValue, k, O);
          A[k] = mappedValue;
        }
        k++;
      }

      return A;
    };

  // 从左到右为每个数组元素执行一次回调函数，并把上次回调函数的返回值放在一个暂存器中传给下次回调函数，并返回最后一次回调函数的返回值
  Array.prototype.reduce =
    Array.prototype.reduce ||
    function(callback /*, initialValue*/) {
      if (this === null) {
        throw new TypeError(
          "Array.prototype.reduce " + "called on null or undefined"
        );
      }
      if (typeof callback !== "function") {
        throw new TypeError(callback + " is not a function");
      }

      var o = Object(this);
      var len = o.length >>> 0;
      var k = 0;
      var value;

      if (arguments.length >= 2) {
        value = arguments[1];
      } else {
        while (k < len && !(k in o)) {
          k++;
        }

        if (k >= len) {
          throw new TypeError(
            "Reduce of empty array " + "with no initial value"
          );
        }
        value = o[k++];
      }

      while (k < len) {
        if (k in o) {
          value = callback(value, o[k], k, o);
        }

        k++;
      }

      return value;
    };

  // 从右到左为每个数组元素执行一次回调函数，并把上次回调函数的返回值放在一个暂存器中传给下次回调函数，并返回最后一次回调函数的返回值
  Array.prototype.reduceRight =
    Array.prototype.reduceRight ||
    function(callback /*, initialValue*/) {
      "use strict";
      if (null === this || "undefined" === typeof this) {
        throw new TypeError(
          "Array.prototype.reduceRight called on null or undefined"
        );
      }
      if ("function" !== typeof callback) {
        throw new TypeError(callback + " is not a function");
      }
      var t = Object(this),
        len = t.length >>> 0,
        k = len - 1,
        value;
      if (arguments.length >= 2) {
        value = arguments[1];
      } else {
        while (k >= 0 && !(k in t)) {
          k--;
        }
        if (k < 0) {
          throw new TypeError(
            "reduceRight of empty array with no initial value"
          );
        }
        value = t[k--];
      }
      for (; k >= 0; k--) {
        if (k in t) {
          value = callback(value, t[k], k, t);
        }
      }
      return value;
    };

  // 返回一个数组迭代器对象，该迭代器会包含所有数组元素的值
  Array.prototype.values =
    Array.prototype.values ||
    function() {
      var self = this;
      var i = 0;
      var len = self.length;
      return {
        next: function() {
          var ret = {
            value: i >= len ? undefined : self[i],
            done: i >= len
          };
          i++;
          return ret;
        }
      };
    };

  // 返回一个由所有数组元素组合而成的本地化后的字符串。遮蔽了原型链上的Object.prototype.toLocaleString()方法 all
  // Array.prototype.toLocaleString

  // 返回一个由所有数组元素组合而成的字符串。遮蔽了原型链上的Object.prototype.toString()方法 all
  // Array.prototype.toString

  // Function

  // 在一个对象的上下文中应用另一个对象的方法；参数能够以数组形式传入
  Function.prototype.apply =
    Function.prototype.apply ||
    function() {
      var context = arguments[0];
      var fn = this;

      if (!util.isFunction(fn)) {
        throw new TypeError("it must be a function");
      }

      var applyArgs = arguments[1];
      !(applyArgs instanceof Array) && (applyArgs = []);
      var args = [];
      for (var i = 0, len = applyArgs.length; i < len; i++) {
        args.push("applyArgs[" + i + "]");
      }

      var result;
      if (context == undefined) {
        result = eval("fn(" + args + ")");
      } else {
        context.fn = fn;
        result = eval("context.fn(" + args + ")");
        delete context.fn;
      }

      return result;
    };

  // bind()方法会创建一个新函数，称为绑定函数。当调用这个绑定函数时，绑定函数会以创建它时传入bind()方法的第一个参数作为this，传入bind()方法的第二个以及以后的参数加上绑定函数运行时本身的参数按照顺序作为原函数的参数来调用原函数
  Function.prototype.bind =
    Function.prototype.bind ||
    function() {
      var args1 = [].slice.call(arguments);
      var context = args1[0];
      var fn = this;

      if (!util.isFunction(fn)) {
        throw new TypeError("it must be a function.");
      }

      var args = [];
      for (var i = 1, len = args1.length; i < len; i++) {
        args.push("args1[" + i + "]");
      }

      return function F() {
        var args2 = arguments;
        for (var j = 0, len = args2.length; j < len; j++) {
          args.push("args2[" + j + "]");
        }
        if (this instanceof F) {
          return eval("new fn(" + args + ")");
        } else {
          return fn.apply(context, args1.slice(1).concat(args2));
        }
      };
    };

  // 在一个对象的上下文中应用另一个对象的方法；参数能够以列表形式传入
  Function.prototype.call =
    Function.prototype.call ||
    function() {
      var context = arguments[0];
      var fn = this;

      if (!util.isFunction(fn)) {
        throw new TypeError("it must be a function.");
      }

      var args = [];
      for (var i = 1, len = arguments.length; i < len; i++) {
        args.push("arguments[" + i + "]");
      }

      var result;
      if (context == undefined) {
        result = eval("fn(" + args + ")");
      } else {
        context.fn = fn;
        result = eval("context.fn(" + args + ")");
        delete context.fn;
      }

      return result;
    };

  // 获取函数的实现源码的字符串。覆盖了Object.prototype.toString方法 ie5
  // Function.prototype.toString

  // String

  // 返回由指定的UTF-16代码单元序列创建的字符串 all
  // String.fromCharCode

  // 返回使用指定的代码点序列创建的字符串
  // String.fromCodePoint
  if (!String.fromCodePoint)
    (function(stringFromCharCode) {
      var fromCodePoint = function(_) {
        var codeUnits = [],
          codeLen = 0,
          result = "";
        for (var index = 0, len = arguments.length; index !== len; ++index) {
          var codePoint = +arguments[index];

          if (!(codePoint < 0x10ffff && codePoint >>> 0 === codePoint))
            throw RangeError("Invalid code point: " + codePoint);
          if (codePoint <= 0xffff) {
            codeLen = codeUnits.push(codePoint);
          } else {
            codePoint -= 0x10000;
            codeLen = codeUnits.push(
              (codePoint >> 10) + 0xd800,
              (codePoint % 0x400) + 0xdc00
            );
          }
          if (codeLen >= 0x3fff) {
            result += stringFromCharCode.apply(null, codeUnits);
            codeUnits.length = 0;
          }
        }
        return result + stringFromCharCode.apply(null, codeUnits);
      };
      try {
        Object.defineProperty(String, "fromCodePoint", {
          value: fromCodePoint,
          configurable: true,
          writable: true
        });
      } catch (e) {
        String.fromCodePoint = fromCodePoint;
      }
    })(String.fromCharCode);

  // 通过模板字符串创建字符串 chrome41 ien&&ot
  // String.raw

  // 返回特定位置的字符 all
  // String.prototype.charAt

  // 返回表示给定索引的字符的Unicode的值 all
  // String.prototype.charCodeAt

  // 返回使用UTF-16编码的给定位置的值的非负整数
  // String.prototype.codePointAt

  if (!String.prototype.codePointAt) {
    (function() {
      "use strict";
      var codePointAt = function(position) {
        if (this == null) {
          throw TypeError();
        }
        var string = String(this);
        var size = string.length;
        var index = position ? Number(position) : 0;
        if (index != index) {
          // better `isNaN`
          index = 0;
        }
        if (index < 0 || index >= size) {
          return undefined;
        }
        var first = string.charCodeAt(index);
        var second;
        if (first >= 0xd800 && first <= 0xdbff && size > index + 1) {
          second = string.charCodeAt(index + 1);
          if (second >= 0xdc00 && second <= 0xdfff) {
            return (first - 0xd800) * 0x400 + second - 0xdc00 + 0x10000;
          }
        }
        return first;
      };
      try {
        Object.defineProperty(String.prototype, "codePointAt", {
          value: codePointAt,
          configurable: true,
          writable: true
        });
      } catch (e) {
        String.prototype.codePointAt = codePointAt;
      }
    })();
  }

  // 连接两个字符串文本，并返回一个新的字符串 all
  // String.prototype.concat

  // 判断一个字符串里是否包含其他字符串
  String.prototype.includes =
    String.prototype.includes ||
    function(search, start) {
      "use strict";
      if (typeof start !== "number") {
        start = 0;
      }

      if (start + search.length > this.length) {
        return false;
      } else {
        return this.indexOf(search, start) !== -1;
      }
    };

  // 判断一个字符串的是否以给定字符串结尾，结果返回布尔值
  String.prototype.endsWith =
    String.prototype.endsWith ||
    function(search, this_len) {
      if (this_len === undefined || this_len > this.length) {
        this_len = this.length;
      }
      return this.substring(this_len - search.length, this_len) === search;
    };

  // 从字符串对象中返回首个被发现的给定值的索引值，如果没有找到则返回-1 all
  // String.prototype.indexOf

  // 从字符串对象中返回最后一个被发现的给定值的索引值，如果没有找到则返回-1 all
  // String.prototype.lastIndexOf

  // 返回一个数字来指示一个参考字符串是否在排序顺序前面或之后或与给定字符串相同 ie11
  // String.prototype.localeCompare

  // 使用正则表达式与字符串相比较 all
  // String.prototype.match

  // 返回一个包含所有匹配正则表达式及分组捕获结果的迭代器 chrome73 ie&&not
  // String.prototype.matchAll

  // 返回调用字符串值的Unicode标准化形式 chrome34 ie&&not
  // String.prototype.normalize

  // 在当前字符串尾部填充指定的字符串，直到达到指定的长度。返回一个新的字符串
  String.prototype.padEnd =
    String.prototype.padEnd ||
    function(targetLength, padString) {
      targetLength = targetLength >> 0;
      padString = String(typeof padString !== "undefined" ? padString : "");
      if (this.length > targetLength) {
        return String(this);
      } else {
        targetLength = targetLength - this.length;
        if (targetLength > padString.length) {
          padString += padString.repeat(targetLength / padString.length);
        }
        return String(this) + padString.slice(0, targetLength);
      }
    };

  // 在当前字符串头部填充指定的字符串，直到达到指定的长度。返回一个新的字符串
  String.prototype.padStart =
    String.prototype.padStart ||
    function(targetLength, padString) {
      targetLength = targetLength >> 0;
      padString = String(typeof padString !== "undefined" ? padString : " ");
      if (this.length > targetLength) {
        return String(this);
      } else {
        targetLength = targetLength - this.length;
        if (targetLength > padString.length) {
          padString += padString.repeat(targetLength / padString.length);
        }
        return padString.slice(0, targetLength) + String(this);
      }
    };

  // 被用来在正则表达式和字符串直接比较，然后用新的子串来替换被匹配的子串 all
  // String.prototype.replace

  // 返回指定重复次数的由元素组成的字符串对象
  String.prototype.repeat =
    String.prototype.repeat ||
    function(count) {
      "use strict";
      if (this == null) {
        throw new TypeError("can't convert " + this + " to object");
      }
      var str = "" + this;
      count = +count;
      if (count != count) {
        count = 0;
      }
      if (count < 0) {
        throw new RangeError("repeat count must be non-negative");
      }
      if (count == Infinity) {
        throw new RangeError("repeat count must be less than infinity");
      }
      count = Math.floor(count);
      if (str.length == 0 || count == 0) {
        return "";
      }

      if (str.length * count >= 1 << 28) {
        throw new RangeError(
          "repeat count must not overflow maximum string size"
        );
      }
      var rpt = "";
      for (;;) {
        if ((count & 1) == 1) {
          rpt += str;
        }
        count >>>= 1;
        if (count == 0) {
          break;
        }
        str += str;
      }
      return rpt;
    };

  // 对正则表达式和指定字符串进行匹配搜索，返回第一个出现的匹配项的下标 all
  // String.prototype.search

  // 摘取一个字符串区域，返回一个新的字符串 all
  // String.prototype.slice

  // 通过分离字符串成字串，将字符串对象分割成字符串数组 all
  // String.prototype.split

  // 判断字符串的起始位置是否匹配其他字符串中的字符
  String.prototype.startsWith =
    String.prototype.startsWith ||
    function(search, pos) {
      pos = !pos || pos < 0 ? 0 : +pos;
      return this.substring(pos, pos + search.length) === search;
    };

  // 通过指定字符数返回在指定位置开始的字符串中的字符
  // Microsoft's JScript 不支持负的 start 索引。如果你想充分利用该方法的功能，则需要使用下面的兼容性代码修复此 bug：
  if ("ab".substr(-1) != "b") {
    String.prototype.substr = (function(substr) {
      return function(start, length) {
        if (start < 0) start = this.length + start;

        return substr.call(this, start, length);
      };
    })(String.prototype.substr);
  }

  // 返回在字符串中指定两个下标之间的字符 all
  // String.prototype.substring

  // 根据当前区域设置，将符串中的字符转换成小写。对于大多数语言来说，toLowerCase的返回值是一致的 all
  // String.prototype.toLocaleLowerCase

  // 根据当前区域设置，将字符串中的字符转换成大写，对于大多数语言来说，toUpperCase的返回值是一致的 all
  // String.prototype.toLocaleUpperCase

  // 将字符串转换成小写并返回 all
  // String.prototype.toLowerCase

  // 将字符串转换成大写并返回 all
  // String.prototype.toUpperCase

  // 从字符串的开始和结尾去除空格。参照部分ECMAScript5标准
  String.prototype.trim =
    String.prototype.trim ||
    function() {
      return this.replace(/^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g, "");
    };

  // 从字符串的左侧去除空格
  String.prototype.trimStart =
    String.prototype.trimStart ||
    function() {
      return this.replace(/^[\s\uFEFF\xA0]+/g, "");
    };

  // 从字符串的右侧去除空格
  String.prototype.trimEnd =
    String.prototype.trimEnd ||
    function() {
      return this.replace(/^[\s\uFEFF\xA0]+$/g, "");
    };

  // 返回用字符串表示的特定对象。重写Object.prototype.toString方法 all
  // String.prototype.toString

  // 返回特定对象的原始值。重写Object.prototype.valueOf方法 all
  // String.prototype.valueOf

  // Boolean
  // 一个布尔值的对象包装器

  // null
  // 特指对象的值未设置。它是JavaScript基本类型之一

  // undefined
  // 全局属性undefined表示原始值undefined。它是一个JavaScript的原始数据类型

  // Symbol  chrome38 edge12 ie&&not
  // Symbol()函数会返回symbol类型的值，该类型具有静态属性和静态方法。它的静态属性会暴露几个内建的成员对象；它的静态方法会暴露全局的symbol注册，且类似于内建对象类，但作为构造函数来说它并不完整，因为它不支持语法："new Symbol()"
  // 每个从Symbol()返回的symbol值都是唯一的。一个symbol值能作为对象属性的标识符；这是该数据类型仅有的目的。更进一步的解析见—— glossary entry for Symbol

  // Number

  // 两个可表示(representable)数之间的最小间隔 chrome?? ie&&not
  Number.EPSILON == Number.EPSILON || Math.pow(2, -52);

  // JavaScript中最大的安全整数(2^53 - 1)
  Number.MAX_SAFE_INTEGER = Number.MAX_SAFE_INTEGER || Math.pow(2, 53) - 1;

  // 能表示的最大正数。最小的负数是-MAX_VALUE  all
  // MAX_VALUE 属性值接近于 1.79E+308。大于 MAX_VALUE 的值代表 "Infinity"
  // Number.MAX_VALUE

  // JavaScript中最小的安全整数(-(2^53 - 1))
  Number.MIN_SAFE_INTEGER = Number.MIN_SAFE_INTEGER || -(Math.pow(2, 53) - 1);

  // 能表示的最小正数即最接近0的正数(实际上不会变成0)。最大的负数是-MIN_VALUE  all
  // MIN_VALUE的值约为5e-324。小于MIN_VALUE("underflow values")的值将会转换为 0
  // Number.MIN_VALUE

  // 特殊的“非数字”值  all
  // Number.NaN

  // 特殊的负无穷大值，在溢出时返回该值  all
  // Number.NEGATIVE_INFINITY

  // 特殊的正无穷大值，在溢出时返回该值  all
  // Number.POSITIVE_INFINITY

  // 确定传递的值是否是NaN
  Number.isNaN =
    Number.isNaN ||
    function(value) {
      return typeof value === "number" && isNaN(value);
    };

  // 确定传递的值类型及本身是否是有限数
  Number.isFinite =
    Number.isFinite ||
    function(value) {
      return typeof value === "number" && isFinite(value);
    };

  // 确定传递的值类型是“number”，且是整数
  Number.isInteger =
    Number.isInteger ||
    function(value) {
      return (
        typeof value === "number" &&
        isFinite(value) &&
        Math.floor(value) === value
      );
    };

  // 确定传递的值是否为安全整数(-(2^53 - 1)至2^53 - 1之间)
  Number.isSafeInteger =
    Number.isSafeInteger ||
    function(value) {
      return (
        Number.isInteger(value) && Math.abs(value) <= Number.MAX_SAFE_INTEGER
      );
    };

  // 和全局对象parseFloat()一样
  Number.parseFloat = Number.parseFloat || parseFloat;

  // 和全局对象parseInt()一样
  Number.parseInt = Number.parseInt || parseInt;

  // 返回以定点表示法表示数字的字符串  all
  // Number.prototype.toFixed

  // NaN all
  // 全局属性NaN的值表示不是一个数字（Not-A-Number）

  // Infinity all
  // 全局属性Infinity是一个数值，表示无穷大

  // Math
  // Math.abs: 返回x的绝对值  all
  // Math.acos: 返回x的反余弦值  all
  // Math.acosh: 返回x的反双曲余弦值  chrome38 ie&&not
  // Math.asin: 返回x的反正弦值  all
  // Math.asinh: 返回x的反双曲正弦值  chrome38 ie&&not
  // Math.atan: 以介于 -PI/2 与 PI/2 弧度之间的数值来返回 x 的反正切值  all
  // Math.atanh: 返回x的反双曲正切值  chrome38 ie&&not
  // Math.atan2: 返回y/x的反正切值  all
  // Math.cbrt: 返回x的立方根
  Math.cbrt =
    Math.cbrt ||
    function(x) {
      var y = Math.pow(Math.abs(x), 1 / 3);
      return x < 0 ? -y : y;
    };
  // Math.ceil: 返回x向上取整后的值  all
  // Math.clz32: 返回一个32位整数的前导零的数量
  Math.clz32 =
    Math.clz32 ||
    function(value) {
      var value = Number(value) >>> 0;
      return value ? 32 - value.toString(2).length : 32;
    };
  // Math.cos: 返回x的余弦值  all
  // Math.cosh: 返回x的双曲余弦值
  Math.cosh =
    Math.cosh ||
    function(x) {
      var y = Math.exp(x);
      return (y + 1 / y) / 2;
    };
  // Math.exp: 返回E^x, 当x为参数, E是欧拉常数(2.718...), 自然对数的底  all
  // Math.expm1: 返回 exp(x)-1 的值
  Math.expm1 =
    Math.expm1 ||
    function(x) {
      return Math.exp(x) - 1;
    };
  // Math.floor: 返回小于x的最大整数  all
  // Math.fround: 返回数字的最接近的单精度浮点型表示  chrome38 ie&&not
  // Math.fround = Math.fround || (function (array) {
  //   return function(x) {
  //     return array[0] = x, array[0];
  //   };
  // })(new Float32Array(1));
  // Math.hypot: 返回其参数平方和的平方根
  Math.hypot =
    Math.hypot ||
    function hypot() {
      var y = 0;
      var length = arguments.length;

      for (var i = 0; i < length; i++) {
        if (arguments[i] === Infinity || arguments[i] === -Infinity) {
          return Infinity;
        }
        y += arguments[i] * arguments[i];
      }
      return Math.sqrt(y);
    };
  // Math.imul: 返回32位整数乘法的结果
  Math.imul =
    Math.imul ||
    function(a, b) {
      var ah = (a >>> 16) & 0xffff;
      var al = a & 0xffff;
      var bh = (b >>> 16) & 0xffff;
      var bl = b & 0xffff;
      // 右移0位可以修复高位的符号位
      return al * bl + (((ah * bl + al * bh) << 16) >>> 0);
    };
  // Math.log: 返回一个数的自然对数（loge，即ln）  all
  // Math.log1p: 返回1加上一个数字的的自然对数（loge，即ln）  chrome&&not ie&&not
  // Math.log10: 返回以10为底数的x的对数  chrome&&not ie&&not
  // Math.log2: 返回以2为底数的x的对数  chrome&&not ie&&not
  // Math.max: 返回0个到多个数值中最大值  all
  // Math.min: 返回0个到多个数值中最小值  all
  // Math.pow: 返回x的y次幂  all
  // Math.random: 返回0到1之间的伪随机数  all
  // Math.round: 返回四舍五入后的整数  all
  // Math.sign: 返回x的符号函数, 判定x是正数,负数还是0
  Math.sign =
    Math.sign ||
    function(x) {
      x = +x;
      if (x === 0 || isNaN(x)) return x;
      return x > 0 ? 1 : -1;
    };
  // Math.sin: 返回正弦值  all

  // Math.sinh: 返回x的双曲正弦值
  Math.sign =
    Math.sign ||
    function(x) {
      return (Math.exp(x) - Math.exp(-x)) / 2;
    };
  // Math.sqrt: 返回x的平方根  all
  // Math.tan: 返回x的正切值  all
  // Math.tanh: 返回x的双曲正切值
  Math.tanh =
    Math.tanh ||
    function(x) {
      if (x === Infinity) {
        return 1;
      } else if (x === -Infinity) {
        return -1;
      } else {
        var y = Math.exp(2 * x);
        return (y - 1) / (y + 1);
      }
    };
  // Math.trunc: 返回x的整数部分,去除小数
  Math.trunc =
    Math.trunc ||
    function(v) {
      v = +v;
      if (!isFinite(v)) return v;

      return v - (v % 1) || (v < 0 ? -0 : v === 0 ? v : 0);
    };

  // BigInt
  // 在JavaScript中，Number可以准确表达的最大数字是25^3-1，大于等于253的所有数字可以使用BigInt表达
  // 可以这样定义一个 BigInt 变量：在一个整数字面量后面加 n，如：10n，或者调用函数BigInt()
  // 它在某些方面类似于Number，但是也有几个关键的不同点：不能和Math对象中的方法一起使用；不能和任何Number实例混合运算。
  // BigInt64Array || BigUint64Array

  // ArrayBuffer ie10
  // ArrayBuffer对象用来表示通用的、固定长度的原始二进制数据缓冲区。ArrayBuffer 不能直接操作，而是要通过类型数组对象或DataView对象来操作，它们会将缓冲区中的数据表示为特定的格式，并通过这些格式来读写缓冲区的内容

  // DataView ie10
  // DataView视图是一个可以从ArrayBuffer对象中读写多种数值类型的底层接口，使用它时，不用考虑不同平台的字节序问题

  // TypedArray ie10
  // 一个TypedArray对象描述一个底层的二进制数据缓存区的一个类似数组(array-like)视图。事实上，没有名为TypedArray的全局对象，也没有一个名为的TypedArray构造函数。相反，有许多不同的全局对象，下面会列出这些针对特定元素类型的类型化数组的构造函数。在下面的页面中，你会找到一些不管什么类型都公用的属性和方法
  //   类型	 大小（字节单位）	    描述	                 Web IDL type	  C语言等效类型
  // Int8Array	    1	  8位二进制带符号整数 -2^7~(2^7) - 1	byte	        int8_t
  // Uint8Array	    1	  8位无符号整数 0~(2^8) - 1	         octet	       uint8_t
  // Int16Array	    2	  16位二进制带符号整数 -2^15~(2^15)-1	short	        int16_t
  // Uint16Array	  2	  16位无符号整数 0~(2^16) - 1	   unsigned short	   uint16_t
  // Int32Array	    4	  32位二进制带符号整数 -2^31~(2^31)-1	long	        int32_t
  // Uint32Array  	4	  32位无符号整数 0~(2^32) - 1	   unsigned  int	   uint32_t
  // Float32Array	  4	  32位IEEE浮点数	             unrestricted float	  float
  // Float64Array	  8	  64位IEEE浮点数	             unrestricted double	double

  // SharedArrayBuffer  chrome16 edge16 ie&&not
  // SharedArrayBuffer对象用来表示一个通用的，固定长度的原始二进制数据缓冲区，类似于 ArrayBuffer对象，它们都可以用来在共享内存（shared memory）上创建视图。与ArrayBuffer不同的是，SharedArrayBuffer不能被分离

  // Atomics  chrome16 edge16 ie&&not
  // 对象提供了一组静态方法用来对 SharedArrayBuffer 对象进行原子操作
  // 这些原子操作属于Atomics模块。与一般的全局对象不同，Atomics 不是构造函数，因此不能使用new 操作符调用，也不能将其当作函数直接调用。Atomics的所有属性和方法都是静态的（与Math对象一样）

  // RegExp
  // RegExp.prototype.exec  all
  // RegExp.prototype.test  all

  // Date
  // ...  all
  // now 方法返回自1970年1月1日 00:00:00 UTC到当前时间的毫秒数  ie9
  Date.now =
    Date.now ||
    function now() {
      return new Date().getTime();
    };
  // getTimezoneOffset 方法返回协调世界时（UTC）相对于当前时区的时间差值，单位为分钟  ie5
  // toISOString 返回一个 ISO（ISO Format）格式的字符串： YYYY-MM-DDTHH:mm:ss.sssZ
  if (!Date.prototype.toISOString) {
    (function() {
      function pad(number) {
        if (number < 10) {
          return "0" + number;
        }
        return number;
      }

      Date.prototype.toISOString = function() {
        return (
          this.getUTCFullYear() +
          "-" +
          pad(this.getUTCMonth() + 1) +
          "-" +
          pad(this.getUTCDate()) +
          "T" +
          pad(this.getUTCHours()) +
          ":" +
          pad(this.getUTCMinutes()) +
          ":" +
          pad(this.getUTCSeconds()) +
          "." +
          (this.getUTCMilliseconds() / 1000).toFixed(3).slice(2, 5) +
          "Z"
        );
      };
    })();
  }

  // toJSON 返回 Date 对象的字符串形式  ie8

  // JSON

  // parse: 解析JSON字符串并返回对应的值，可以额外传入一个转换函数，用来将生成的值和其属性,在返回之前进行某些修改
  // stringify: 返回与指定值对应的JSON字符串，可以通过额外的参数,控制仅包含某些属性,或者以自定义方法来替换某些key对应的属性值
  if (!window.JSON) {
    window.JSON = {
      parse: function(sJSON) {
        return eval("(" + sJSON + ")");
      },
      stringify: (function() {
        var toString = Object.prototype.toString;
        var isArray =
          Array.isArray ||
          function(a) {
            return toString.call(a) === "[object Array]";
          };
        var escMap = {
          '"': '\\"',
          "\\": "\\\\",
          "\b": "\\b",
          "\f": "\\f",
          "\n": "\\n",
          "\r": "\\r",
          "\t": "\\t"
        };
        var escFunc = function(m) {
          return (
            escMap[m] ||
            "\\u" + (m.charCodeAt(0) + 0x10000).toString(16).substr(1)
          );
        };
        var escRE = /[\\"\u0000-\u001F\u2028\u2029]/g;
        return function stringify(value) {
          if (value == null) {
            return "null";
          } else if (typeof value === "number") {
            return isFinite(value) ? value.toString() : "null";
          } else if (typeof value === "boolean") {
            return value.toString();
          } else if (typeof value === "object") {
            if (typeof value.toJSON === "function") {
              return stringify(value.toJSON());
            } else if (isArray(value)) {
              var res = "[";
              for (var i = 0; i < value.length; i++)
                res += (i ? ", " : "") + stringify(value[i]);
              return res + "]";
            } else if (toString.call(value) === "[object Object]") {
              var tmp = [];
              for (var k in value) {
                if (value.hasOwnProperty(k))
                  tmp.push(stringify(k) + ": " + stringify(value[k]));
              }
              return "{" + tmp.join(", ") + "}";
            }
          }
          return '"' + value.toString().replace(escRE, escFunc) + '"';
        };
      })()
    };
  }

  // global
  // 获取全局对象
  // var getGlobal = function () {
  //   if (typeof self !== 'undefined') { return self; }
  //   if (typeof window !== 'undefined') { return window; }
  //   if (typeof global !== 'undefined') { return global; }
  //   throw new Error('unable to locate global object');
  // };

  if (!window.requestAnimationFrame) {
    window.requestAnimationFrame = (function(window) {
      var lastTime = 0;
      return function(callback) {
        var currTime = new Date().getTime();
        var timeToCall = Math.max(0, 16.7 - (currTime - lastTime));
        var id = window.setTimeout(function() {
          callback(currTime + timeToCall);
        }, timeToCall);
        lastTime = currTime + timeToCall;
        return id;
      };
    })(window);
  }
  if (!window.cancelAnimationFrame) {
    window.cancelAnimationFrame = function(id) {
      clearTimeout(id);
    };
  }

  // decodeURI  all
  // 将已编码URI中所有能识别的转义序列转换成原字符，但不能解码那些不会被encodeURI编码的内容（例如'#'）

  // decodeURIComponent  all
  // 将已编码URI中所有能识别的转义序列转换成原字符

  // encodeURI  all
  // 通过将特定字符的每个实例替换为一个、两个、三或四转义序列来对统一资源标识符(URI)进行编码(该字符的UTF-8编码仅为四转义序列)由两个'代理'字符组成)

  // encodeURIComponent  all
  // 对统一资源标识符（URI）的组成部分进行编码的方法。它使用一到四个转义序列来表示字符串中的每个字符的UTF-8编码（只有由两个Unicode代理区字符组成的字符才用四个转义字符编码）

  // escape  all
  // 废弃的escape()方法生成新的由十六进制转义序列替换的字符串.使用encodeURI或encodeURIComponent代替

  // eval  all
  // 会将传入的字符串当做JavaScript代码进行执行

  // isFinite  all
  // 用来判断被传入的参数值是否为一个有限数值（finite number）。在必要情况下，参数会首先转为一个数值

  // isNaN  all
  // 确定一个值是否为NaN

  // parseFloat  all
  // 解析一个字符串参数并返回一个浮点数

  // parseInt  all
  // 解析一个字符串参数并返回一个整数

  // unescape  all
  // 已废弃的unescape()方法计算生成一个新的字符串，其中的十六进制转义序列将被其表示的字符替换。建议使用decodeURI或者decodeURIComponent替代本方法

  // globalThis  chrome71 edge&&not ie&&not
  // 可以获取全局对象

  // Error ie6
  // 通过Error的构造器可以创建一个错误对象。当运行时错误产生时，Error的实例对象会被抛出。
  // EvalError: 创建一个error实例，表示错误的原因：与eval()有关。
  // RangeError: 创建一个error实例，表示错误的原因：数值变量或参数超出其有效范围。
  // ReferenceError: 创建一个error实例，表示错误的原因：无效引用。
  // SyntaxError: 创建一个error实例，表示错误的原因：eval()在解析代码的过程中发生的语法错误。
  // TypeError: 创建一个error实例，表示错误的原因：变量或参数不属于有效类型。
  // URIError: 创建一个error实例，表示错误的原因：给encodeURI()或decodeURl()传递的参数无效。

  // Map  chrome38 edge12 ie11
  // WeakMap  chrome36 edge12 ie11
  // Set  chrome38 edge12 ie11
  // WeakSet  chrome?? edge&&maybe?? ie&&not
  // Promise  chrome32 ie&&not
  // Generator  chrome39 edge13 ie&&not
  // GeneratorFunction  chrome?? edge?? ie&&not
  // AsyncFunction  chrome55 edge15 ie&&not
  // Reflect  chrome49 edge12 ie&&not
  // Proxy  chrome49 edge12 ie&&not

  // WebAssembly  chrome57 edge16
  // WebAssembly对象主要用于：
  // 使用WebAssembly.instantiate()函数加载WebAssembly代码。
  // 通过WebAssembly.Memory()/WebAssembly.Table()构造函数创建新的内存和表实例。
  // 由WebAssembly.CompileError()/WebAssembly.LinkError()/WebAssembly.RuntimeError()构造函数来提供 WebAssembly 中的错误信息。

  // Intl  ie11
  // Intl对象是ECMAScript国际化API的一个命名空间，它提供了精确的字符串对比、数字格式化，和日期时间格式化。Collator，NumberFormat和DateTimeFormat对象的构造函数是Intl对象的属性。本页文档内容包括了这些属性，以及国际化使用的构造器和其他语言的方法等常见的功能
  // Intl.Collator: 用于启用对语言敏感的字符串比较的对象
  // Intl.DateTimeFormat: 用于启用语言敏感的日期和时间格式的对象的构造函数
  // Intl.ListFormat: 用于启用语言敏感列表格式的对象的构造函数
  // Intl.NumberFormat: 用于启用语言敏感数字格式的对象的构造函数。
  // Intl.PluralRules: 用于启用多种敏感格式和多种语言语言规则的对象的构造函数。
  // Intl.RelativeTimeFormat: 用于启用语言敏感的相对时间格式的对象的构造函数。
})();
