/*
 * @Author: gleeman
 * @Date: 2019-07-13 22:24:23
 * @LastEditors: gleeman
 * @LastEditTime: 2019-11-02 20:27:34
 * @Description: such 1.0
 */

!(function(win, doc) {
  "use strict";

  // 全局配置
  var config = {};
  // 文档加载完成回调状态
  var readyState = {
    isOnReady: false,
    isLoaded: false,
    queue: []
  };
  // 模块缓存对象
  var moduleCache = {};
  // 内部模块
  var baseModules = {
    // 工具扩展
    ajax: "lib/ajax",
    animate: "lib/animate",
    browser: "lib/browser",
    calendar: "lib/calendar",
    cookie: "lib/cookie",
    event: "lib/event",
    "event-emitter": "lib/event-emitter",
    feature: "lib/feature",
    pinyinlite: "lib/pinyinlite",
    router: "lib/router",
    template: "lib/template",
    uploader: "lib/uploader",
    uuid: "lib/uuid",
    // 辅助方法
    array: "util/array",
    assert: "util/assert",
    "axis-promise": "util/axis-promise",
    date: "util/date",
    error: "util/error",
    func: "util/func",
    math: "util/math",
    number: "util/number",
    object: "util/object",
    string: "util/string"
  };
  // 获取axis所在目录
  var getPath = (function() {
    var jsPath = doc.currentScript
      ? doc.currentScript.src
      : (function() {
          var js = doc.scripts,
            last = js.length - 1,
            src;
          for (var i = last; i > 0; i--) {
            if (js[i].readyState === "interactive") {
              src = js[i].src;
              break;
            }
          }
          return src || js[last].src;
        })();
    return jsPath.substring(0, jsPath.lastIndexOf("/") + 1);
  })();

  function Such() {
    this.version = "1.0";
  }

  // 定义模块
  Such.prototype.define = function() {
    var args = [].slice.call(arguments),
      factory = args.pop(),
      len = args.length,
      dependencies = len && args[len - 1] instanceof Array ? args.pop() : [],
      moduleName = args.pop();
    typeof factory !== "function" && (factory = function() {});
    if (!moduleCache[moduleName]) {
      moduleCache[moduleName] = {
        moduleName: moduleName,
        status: "loading",
        url: "",
        exports: null,
        onload: []
      };
    }
    moduleCache[moduleName].dependencies = dependencies;
    moduleCache[moduleName].factory = factory;
    return this.use(dependencies, factory);
  };

  // 使用模块
  Such.prototype.use = function(dependencies, factory) {
    if (!(dependencies instanceof Array)) {
      dependencies = typeof dependencies === "string" ? [dependencies] : [];
    }
    typeof factory !== "function" && (factory = function() {});
    var params = [],
      depsCount = dependencies.length,
      moduleName = null,
      i = 0;
    for (var key in moduleCache) {
      if (moduleCache.hasOwnProperty(key)) {
        if (moduleCache[key] && moduleCache[key].factory === factory) {
          moduleName = key;
        }
      }
    }
    if (depsCount === 0) {
      setModule(moduleName, params, factory);
    } else {
      while (i < dependencies.length) {
        (function(i) {
          loadModule(dependencies[i], function(mod) {
            params[i] = mod;
            depsCount--;
            if (depsCount === 0) {
              setModule(moduleName, params, factory);
            }
          });
        })(i);
        i++;
      }
    }
    return this;
  };

  // 异常提示
  Such.prototype.error = function(msg) {
    if (win.console && console.error) {
      console.error("Such hint: " + msg);
    } else {
      throw new Error("Such hint: " + msg);
    }
  };

  // 模块配置
  Such.prototype.config = function(options) {
    options = options || {};
    for (var key in options) {
      if (options.hasOwnProperty(key)) {
        config[key] = options[key];
      }
    }
    return this;
  };

  // 记录模块
  Such.prototype.modules = (function() {
    var clone = {};
    for (var o in baseModules) {
      if (baseModules.hasOwnProperty(o)) {
        clone[o] = baseModules[o];
      }
    }
    return clone;
  })();

  // 加载模块
  function loadModule(moduleName, callback) {
    var _module;
    if (moduleCache[moduleName]) {
      _module = moduleCache[moduleName];
      if (_module.status === "loaded") {
        callback(_module.exports);
      } else {
        _module.onload.push(callback);
      }
    } else {
      var url = getUrl(moduleName);
      moduleCache[moduleName] = {
        moduleName: moduleName,
        factory: null,
        dependencies: [],
        status: "loading",
        url: url,
        exports: null,
        onload: [callback]
      };
      loadScript(url);
    }
  }

  // 模块回调
  function setModule(moduleName, params, factory) {
    var _module, fn;
    if (moduleCache[moduleName]) {
      _module = moduleCache[moduleName];
      _module.status = "loaded";
      _module.exports = factory.apply(_module, params);
      while ((fn = _module.onload.shift())) {
        fn(_module.exports);
      }
      // 删除script标签
      var scripts = document.getElementsByTagName("script");
      for (var i = 0; i < scripts.length; i++) {
        var script = scripts[i];
        if (script.src === _module.url) {
          script.parentElement.removeChild(script);
          break;
        }
      }
    } else {
      factory.apply(null, params);
    }
  }

  // 解析路径
  function getUrl(moduleName) {
    var dir = (config.dir = config.dir ? config.dir : getPath);
    // 如果是内置模块，则按照 dir 参数拼接模块路径
    // 如果是扩展模块，则判断模块路径值是否为 {/} 开头，
    // 如果路径值是 {/} 开头，则模块路径即为后面紧跟的字符。
    // 否则，则按照 base 参数拼接模块路径
    var url =
      (baseModules[moduleName]
        ? dir + "module/"
        : /^\{\/\}/.test(such.modules[moduleName])
        ? ""
        : config.base || "") +
      (such.modules[moduleName] || moduleName) +
      ".js";

    url = url.replace(/^\{\/\}/, "");
    if (config.version === true) {
      url += "?v=" + (config.v || new Date().getTime());
    }
    return url;
  }

  // 加载脚本
  function loadScript(src) {
    var _script = doc.createElement("script");
    _script.type = "text/javascript";
    _script.charset = "UTF-8";
    _script.async = true;
    _script.src = src;
    doc.getElementsByTagName("head")[0].appendChild(_script);
  }

  // 对象继承
  Such.prototype["extends"] = function(
    SuperClass,
    ownPropertiesAssign,
    prototypeAssign
  ) {
    if (typeof SuperClass !== "function") {
      throw new Error('"SuperClass" must be a function');
    }
    var _such = this;

    function SubClass() {
      SuperClass.apply(this, arguments);
      _such.apply(this, ownPropertiesAssign);
    }
    // 原型继承
    inheritParasitism(SubClass, SuperClass);
    // 原型扩展
    _such.apply(SubClass.prototype, prototypeAssign);

    return SubClass;
  };

  // 原型式继承
  function inheritPrototype(o) {
    function F() {}
    F.prototype = o;
    return new F();
  }

  // 寄生式继承
  function inheritParasitism(SubClass, SuperClass) {
    var p = inheritPrototype(SuperClass.prototype);
    p.constructor = SubClass;
    SubClass.prototype = p;
  }

  // 对象扩展
  Such.prototype.apply = function(target) {
    if (!(target instanceof Object)) {
      target = {};
    }
    var args = Array.prototype.slice.call(arguments).slice(1);
    args.forEach(function(item) {
      if (item instanceof Object) {
        for (var key in item) {
          if (item.hasOwnProperty(key)) {
            target[key] = item[key];
          }
        }
      }
    });
    return target;
  };

  // 文档加载完成
  Such.prototype.ready = function(fn) {
    if (typeof fn === "function") {
      if (!readyState.isLoaded) {
        // 保证回调函数队列（在IE浏览器中）执行顺序一致
        readyState.queue.push(fn);
        if (!readyState.isOnReady) {
          readyState.isOnReady = true;
          contentLoadedReady(function() {
            readyState.isLoaded = true;
            var cb;
            while ((cb = readyState.queue.shift())) {
              cb();
            }
          });
        }
      } else {
        fn();
      }
    }
  };

  // 文档加载完成回调
  function contentLoadedReady(fn) {
    if (doc.addEventListener) {
      contentLoadedReady = function(fn) {
        doc.addEventListener(
          "DOMContentLoaded",
          function ready() {
            doc.removeEventListener("DOMContentLoaded", ready, false);
            fn();
          },
          false
        );
      };
    } else if (doc.attachEvent) {
      contentLoadedReady = IEContentLoadedReady;
    } else {
      contentLoadedReady = function(fn) {
        win.onload = function() {
          win.onload = null;
          fn();
        };
      };
    }
    contentLoadedReady(fn);
  }

  // IE浏览器文档加载完成回调
  function IEContentLoadedReady(fn) {
    var done = false;
    function init() {
      if (!done) {
        done = true;
        fn();
      }
    }
    (function polling() {
      try {
        doc.documentElement.doScroll("left");
      } catch (e) {
        setTimeout(polling, 19);
        return;
      }
      init();
    })();
    doc.onreadystatechange = function() {
      if (doc.readyState == "complete") {
        doc.onreadystatechange = null;
        init();
      }
    };
  }

  win.such = new Such();
})(window, document);
