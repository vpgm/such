/*
 * @Author: gleeman
 * @Date: 2019-08-17 01:34:15
 * @LastEditors: gleeman
 * @LastEditTime: 2019-11-02 14:33:40
 * @Description: 字符串方法扩展
 */

such.define("string", ["assert", "error", "object"], function(
  assert,
  error,
  object
) {
  "use strict";

  var string = {
    // 首字母为大写，剩下为小写
    capitalize: function(str) {
      var ret = "";
      if (!assert.isString(str)) {
        return ret;
      }
      return str.charAt(0).toUpperCase() + str.substring(1);
    },
    // => 大/小驼峰
    camelCase: function(str, flag) {
      var ret = "",
        num = 0;
      if (!assert.isString(str)) {
        return ret;
      }
      ret = str
        .replace(/([^\d])(\d+)/g, "$1-$2")
        .replace(/(\d+)([^\d])/g, "$1-$2")
        .replace(/([a-z])([A-Z])/g, "$1-$2")
        .replace(/([A-Z]+)([A-Z][a-z])/g, "$1-$2");
      ret = ret.toLowerCase();
      var arr = ret.split(/[^a-z\d]/);
      var first_char;
      arr = arr.map(function(item) {
        if (item !== "") {
          first_char = item.charAt(0);
          if (/[a-z]/.test(first_char) && !flag) {
            flag = true;
          } else {
            first_char = first_char.toUpperCase();
          }
          item = first_char + item.substring(1);
        }
        return item;
      });
      ret = arr.join("");
      return ret;
    },
    // 大驼峰
    pascalCase: function(str) {
      return this.camelCase(str, true);
    },
    // => 中划线小写 helloWorld => hello-world
    // kebab: 烤肉串
    kebabCase: function(str) {
      var ret = "";
      if (!assert.isString(str)) {
        return ret;
      }
      ret = str
        .replace(/([^\d])(\d+)/g, "$1-$2")
        .replace(/(\d+)([^\d])/g, "$1-$2")
        .replace(/([a-z])([A-Z])/g, "$1-$2")
        .replace(/([A-Z]+)([A-Z][a-z])/g, "$1-$2");
      ret = ret.toLowerCase();
      var filter = ret.split(/[^a-z\d]/).filter(function(item) {
        return item !== "";
      });
      return filter.join("-");
    },
    // => 下划线大/小写 helloWorld => hello_world || HELLO_WORLD
    snakeCase: function(str, flag) {
      var ret = "";
      if (!assert.isString(str)) {
        return ret;
      }
      ret = str
        .replace(/([^\d])(\d+)/g, "$1_$2")
        .replace(/(\d+)([^\d])/g, "$1_$2")
        .replace(/([a-z])([A-Z])/g, "$1_$2")
        .replace(/([A-Z]+)([A-Z][a-z])/g, "$1_$2");
      ret = ret.toLowerCase();
      var filter = ret.split(/[^a-z\d]/).filter(function(item) {
        return item !== "";
      });
      ret = filter.join("_");
      flag && (ret = ret.toUpperCase());
      return ret;
    },
    // 字符串遍历
    each: function(str, iterator) {
      if (!assert.isString(str)) return;
      if (!assert.isFunction(iterator)) {
        error.type('"iterator" must be a function.');
      }
      var result;
      for (var i = 0; i < str.length; i++) {
        result = iterator(str.charAt(i), i, str);
        if (assert.isBoolean(result)) {
          break;
        }
      }
    },
    // 字符串(hashParams/queryParams)参数
    // flag是否解码（decodeURIComponent）
    toJSON: function(str, flag) {
      var ret = {};
      var d = decodeURIComponent;
      if (!assert.isString(str)) {
        return ret;
      }
      var arr = str.split(/\?|#/);
      if (arr.length) {
        arr
          .pop()
          .split("&")
          .forEach(function(item) {
            var new_arr = item.split("=");
            if (new_arr.length > 1) {
              object.set(
                ret,
                flag ? d(new_arr[0]) : new_arr[0],
                flag ? d(new_arr[1]) : new_arr[1]
              );
            }
          });
      }
      return ret;
    },
    // 转化成queryString
    // flag是否转码（encodeURIComponent）
    toQueryString: function(data, flag) {
      if (assert.isString(data)) {
        data = this.toJSON(data, flag);
      }
      var e = encodeURIComponent;
      var params = [];
      var array = object.toArray(data);
      array.forEach(function(item) {
        var key = flag ? e(item.key) : item.key;
        var value = flag ? e(item.value) : item.value;
        params.push(key + "=" + value);
      });
      return params.join('&');
    },
    // 字符串编码转为unicode编码
    enUnicode: function(str) {
      var ret = "";
      if (!assert.isString(str)) {
        return ret;
      }
      for (var i = 0; i < str.length; i++) {
        ret += "\\u" + ("0000" + str.charCodeAt(i).toString(16)).slice(-4);
      }
      return ret;
    },
    // unicode编码转为字符串编码
    deUnicode: function(str) {
      var ret = "";
      if (!assert.isString(str)) {
        return ret;
      }
      var strArray = str.split("\\u");
      // 防止\u开头或结尾，导致解析空串产生的“□”的结果
      if (str.startsWith("\\u")) {
        strArray = strArray.slice(1, strArray.length);
      }
      if (str.endsWith("\\u")) {
        strArray = strArray.slice(0, strArray.length - 1);
      }
      for (var i = 0; i < strArray.length; i++) {
        ret += String.fromCharCode(parseInt(strArray[i], 16));
      }
      return ret;
    },
    // 字符串加密 (escape)
    encode: function(str) {
      var ret = "",
        char;
      if (!assert.isString(str)) {
        return ret;
      }
      for (var i = 0; i < str.length; i++) {
        char = str.charAt(i);
        ret += /[a-zA-Z\d]/.test(char) ? char : this.enUnicode(char);
      }
      ret = ret.replace(/\\u([a-zA-Z\d]{4})/g, function(_, match) {
        match = match.replace(/[a-z]/g, function(mt) {
          return Math.random() >= 0.5 ? mt.toUpperCase() : mt;
        });
        return "%u" + match;
      });
      return ret;
    },
    // 字符串解密 (unescape)
    decode: function(str) {
      var ret = "",
        self = this;
      if (!assert.isString(str)) {
        return ret;
      }
      ret = str.replace(/%u([a-zA-Z\d]{4})/g, function(_, match) {
        return self.deUnicode("\\u" + match.toLowerCase());
      });
      return ret;
    },
    // 判断一个字符由两个字节还是由四个字节组成
    is32Bit: function(char) {
      return assert.isString(char) && char.codePointAt(0) > 0xffff;
    },
    // 字符串编译
    compile: function(template, data) {
      var result = "";
      if (!assert.isString(template)) {
        return result;
      }
      if (!assert.isObjectLike(data)) {
        return template;
      }
      return template.replace(/\{\{([^\{\}]*)\}\}/g, function(_, match) {
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
    }
  };
  return string;
});
