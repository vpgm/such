/*
 * @Author: gleeman
 * @Date: 2019-07-13 11:42:00
 * @LastEditors: gleeman
 * @LastEditTime: 2019-08-24 22:38:57
 * @Description: 判断变量类型
 */

such.define("assert", function() {
  "use strict";
  
  var assert = {
    /**
     * @description 断言变量类型
     * @param {*} arguments
     * @returns boolean
     */
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
    /**
     * @description 断言变量类型 偏函数
     * @param {*} arguments 变量类型
     * @returns function
     */
    _typeOf: function() {
      var args = [].slice.call(arguments).reverse();
      return this.typeOf.apply(this, args);
    },
    /**
     * @description 断言两个变量/常量是否相等
     * @param {*} arguments
     * @returns boolean
     */
    isEqual: function() {
      if (this.isNaN(arguments[0]) && this.isNaN(arguments[1])) return true;
      return arguments[0] === arguments[1];
    },
    /**
     * @description 是否是原始类型数据
     * @param {*} value
     * @returns boolean
     */
    isPrimitive: function(value) {
      var type = typeof value;
      return (
        value === null || !!type.match(/string|number|boolean|undefined|symbol/)
      );
    },
    /**
     * @description 是否是字符串类型数据
     * @param {*} value
     * @returns boolean
     */
    isString: function(value) {
      return typeof value === "string";
    },
    /**
     * @description 是否是空字符串
     * @param {*} value
     * @returns boolean
     */
    isEmptyString: function(value) {
      return value === "";
    },
    /**
     * @description 是否是数字类型数据
     * @param {*} value
     * @returns boolean
     */
    isNumber: function(value) {
      return typeof value === "number";
    },
    /**
     * @description 是否是零
     * @param {*} value
     * @returns boolean
     */
    isZero: function(value) {
      return value === 0;
    },
    /**
     * @description 是否是整数（数字位数太多会因为精度问题被认为是整数）
     * @param {*} value
     * @returns boolean
     */
    isInteger: function(value) {
      if (Number.isInteger) {
        this.isInteger = Number.isInteger;
      } else {
        this.isInteger = function(value) {
          return this.isRealNumber(value) && Math.round(value) === value;
        };
      }
      return this.isInteger(value);
    },
    /**
     * @description 是否是浮点数
     * @param {*} value
     * @returns boolean
     */
    isFloat: function(value) {
      return (
        this.isRealNumber(value) &&
        (value % 1 !== 0 || value > Number.MAX_SAFE_INTEGER)
      );
    },
    /**
     * @description 是否是实数（数字除了NaN）
     * @param {*} value
     * @returns boolean
     */
    isRealNumber: function(value) {
      return this.isNumber(value) && (value >= 0 || value < 0);
    },
    /**
     * @description 是否是正数
     * @param {*} value
     * @returns boolean
     */
    isPositiveNumber: function(value) {
      return this.isNumber(value) && value > 0;
    },
    /**
     * @description 是否是正整数
     * @param {*} value
     * @returns boolean
     */
    isPositiveInteger: function(value) {
      return this.isInteger(value) && value > 0;
    },
    /**
     * @description 是否是正浮点数
     * @param {*} value
     * @returns boolean
     */
    isPositiveFloat: function(value) {
      return this.isFloat(value) && value > 0;
    },
    /**
     * @description 是否是负数
     * @param {*} value
     * @returns boolean
     */
    isNegativeNumber: function(value) {
      return this.isNumber(value) && value < 0;
    },
    /**
     * @description 是否是负整数
     * @param {*} value
     * @returns boolean
     */
    isNegativeInteger: function(value) {
      return this.isInteger(value) && value < 0;
    },
    /**
     * @description 是否是负浮点数
     * @param {*} value
     * @returns boolean
     */
    isNegativeFloat: function(value) {
      return this.isFloat(value) && value < 0;
    },
    /**
     * @description 是否是非负数
     * @param {*} value
     * @returns boolean
     */
    isNonnegativeNumber: function(value) {
      return this.isNumber(value) && value >= 0;
    },
    /**
     * @description 是否是非负整数
     * @param {*} value
     * @returns boolean
     */
    isNonnegativeInteger: function(value) {
      return this.isInteger(value) && value >= 0;
    },
    /**
     * @description 是否是非负浮点数
     * @param {*} value
     * @returns boolean
     */
    isNonnegativeFloat: function(value) {
      return this.isFloat(value) && value >= 0;
    },
    /**
     * @description 是否是值为NaN
     * @param {*} value
     * @param {*} bool true 是否是NaN数字
     * @returns boolean
     */
    isNaN: function(value, bool) {
      return (!bool || this.isNumber(value)) && !(value >= 0) && !(value < 0);
    },
    /**
     * @description 是否是无穷大数
     * @param {*} value
     * @returns boolean
     */
    isFinite: function(value) {
      return window.isFinite(value);
    },
    /**
     * @description 是否是安全数
     * @param {*} value
     * @returns boolean
     */
    isSafeNumber: function(value) {
      return this.isNumber(value) && value >= -MAX_VALUE && value <= MAX_VALUE;
    },
    /**
     * @description 是否是安全整数
     * @param {*} value
     * @returns boolean
     */
    isSafeInteger: function(value) {
      return (
        this.isInteger(value) &&
        value >= -MAX_SAFE_INTEGER &&
        value <= MAX_SAFE_INTEGER
      );
    },
    /**
     * @description 是否是布尔类型数据
     * @param {*} value
     * @returns boolean
     */
    isBoolean: function(value) {
      return typeof value === "boolean";
    },
    /**
     * @description 是否是undefined类型数据
     * @param {*} value
     * @returns boolean
     */
    isUndefined: function(value) {
      return typeof value === "undefined";
    },
    /**
     * @description 是否是null类型数据
     * @param {*} value
     * @returns boolean
     */
    isNull: function(value) {
      return value === null;
    },
    /**
     * @description 是否是空值
     * @param {*} value
     * @returns boolean
     */
    isEmpty: function(value) {
      return (
        this.isNull(value) ||
        this.isUndefined(value) ||
        this.isEmptyString(value)
      );
    },
    /**
     * @description 是否是symbol类型数据
     * @param {*} value
     * @returns boolean
     */
    isSymbol: function(value) {
      return typeof value === "symbol";
    },
    /**
     * @description 是否是数组
     * @param {*} value
     * @returns boolean
     */
    isArray: function(value) {
      if (Array.isArray) {
        this.isArray = Array.isArray;
      } else {
        this.isArray = this._typeOf.bind(this, "array");
      }
      return this.isArray(value);
    },
    /**
     * @description 是否是类数组
     * @param {*} value
     * @returns boolean
     */
    isArrayLike: function(value) {
      var isArray = this.isArray(value);
      var isPrimitive = this.isPrimitive(value);
      var isFunction = this.isFunction(value);
      var isWindow = this.isWindow(value);
      var len = value && value.length;
      var isSafeLength = this.isSafeLength(len);
      return (
        isArray ||
        (!isPrimitive &&
          !isFunction &&
          !isWindow &&
          isSafeLength &&
          (len === 0 || len - 1 in value))
      );
    },
    /**
     * @description 是否是空数组
     * @param {*} value
     * @returns boolean
     */
    isEmptyArray: function(value) {
      return this.isArray(value) && value.length === 0;
    },
    /**
     * @description 是否是安全的数组长度
     * @param {*} value
     * @returns boolean
     */
    isSafeLength: function(value) {
      return (
        this.isNonnegativeInteger(value) && value <= Number.MAX_SAFE_INTEGER
      );
    },
    /**
     * @description 是否是安全的索引下标
     * @param {*} value
     * @returns boolean
     */
    isSafeIndex: function(value) {
      return (
        this.isNonnegativeInteger(value) && value <= Number.MAX_SAFE_INTEGER - 1
      );
    },
    /**
     * @description 是否是对象
     * @param {*} value
     * @returns boolean
     */
    isObject: function(value) {
      var type = typeof value;
      return !this.isNull(value) && !!type.match(/object|function/);
    },
    /**
     * @description 是否是类对象
     * @param {*} value
     * @returns boolean
     */
    isObjectLike: function(value) {
      return value !== null && typeof value === "object";
    },
    /**
     * @description 是否是解释型对象 Object.getPrototypeOf ie9+
     * @param {*} value
     * @returns boolean
     */
    // isPlainObject: function(value) {
    //   if (typeof value !== "object" || value === null) return false;
    //   var proto = value;
    //   while (Object.getPrototypeOf(proto) !== null) {
    //     proto = Object.getPrototypeOf(proto);
    //   }
    //   return Object.getPrototypeOf(value) === proto;
    // },
    isPlainObject: function(value) {
      if (typeof value !== "object" || value === null) return false;
      return this.typeOf(value, "object");
    },
    /**
     * @description 是否是空解释型对象
     * @param {*} value
     * @returns boolean
     */
    isEmptyPlainObject: function(value) {
      if (!this.isPlainObject(value)) return false;
      var number = 0;
      for (var key in value) {
        if (value.hasOwnProperty(key)) number++;
      }
      return number === 0;
    },
    /**
     * @description 是否是function
     * @param {*} value
     * @returns boolean
     */
    isFunction: function(value) {
      return typeof value === "function";
    },
    /**
     * @description 是否是日期对象
     * @param {*} value
     * @returns boolean
     */
    isDate: function(value) {
      return this.typeOf(value, "date");
    },
    /**
     * @description 是否是正则表达式对象
     * @param {*} value
     * @returns boolean
     */
    isRegExp: function(value) {
      return this.typeOf(value, "regexp");
    },
    /**
     * @description 是否是window对象
     * @param {*} value
     * @returns boolean
     */
    isWindow: function(value) {
      return this.isObjectLike(value) && value.window === value;
    },
    /**
     * @description 是否是原生方法
     * @param {*} value
     * @returns boolean
     */
    isNative: function(value) {
      return this.isFunction(value) && /native code/.test(value.toString());
    }
  };

  return assert;
});
