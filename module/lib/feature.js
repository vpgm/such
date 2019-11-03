/*
 * @Author: gleeman
 * @Date: 2019-07-23 19:33:26
 * @LastEditors: gleeman
 * @LastEditTime: 2019-09-13 20:22:42
 * @Description: 浏览器特征检测
 */

such.define("feature", ["assert"], function(assert) {
  "use strict";
  
  var docEl = document.documentElement;
  var nav = window.navigator || {};

  var util = {
    create: function(el) {
      return document.createElement(el);
    },

    // 是否旧android设备(silk：音频编码)
    old: !!/(Android\s(1\.|2\.))|(Silk\/1\.)/i.test(nav.userAgent),

    // 返回css标准属性的前缀版本
    prefix: (function() {
      var style = document.createElement("dummy").style;
      var prefixes = ["Webkit", "Moz", "O", "ms"];
      var memory = {};

      return function(prop) {
        if (assert.isUndefined(memory[prop])) {
          var ucProp = prop.charAt(0).toUpperCase() + prop.substr(1);
          var prefixedProps = prefixes.join(ucProp + " ");
          var props = (prop + " " + prefixedProps + ucProp).split(" ");

          memory[prop] = null;

          for (var i in props) {
            if (!assert.isUndefined(style[props[i]])) {
              memory[prop] = props[i];
              break;
            }
          }
        }
        return memory[prop];
      };
    })()
  };

  var feature = {
    css3Dtransform: (function() {
      var test = !util.old && util.prefix("perspective") !== null;
      return !!test;
    })(),

    cssTransform: (function() {
      var test = !util.old && util.prefix("transformOrigin") !== null;
      return !!test;
    })(),

    cssTransition: (function() {
      var test = util.prefix("transition") !== null;
      return !!test;
    })(),

    css3Supported: (function() {
      var div = document.createElement("div"),
        vendors = "Ms O Moz Webkit".split(" "),
        len = vendors.length;

      return function(prop) {
        if (prop in div.style) return true;

        prop = prop.replace(/^[a-z]/, function(val) {
          return val.toUpperCase();
        });

        while (len--) {
          if (vendors[len] + prop in div.style) {
            return true;
          }
        }
        return false;
      };
    })(),

    addEventListener: !!window.addEventListener,

    removeEventListener: !!window.removeEventListener,

    querySelector: !!document.querySelector,

    querySelectorAll: !!document.querySelectorAll,

    // if (window.matchMedia("(max-width: 700px)").matches) ...
    matchMedia: !!window.matchMedia,

    // 提供设备的加速信息，表示为定义在设备上的坐标系中的卡尔迪坐标，还提供了设备在坐标系中的自转速率
    deviceMotion: "DeviceMotionEvent" in window,

    // 提供设备的物理方向信息，表示为一系列本地坐标系的旋角
    deviceOrientation: "DeviceOrientationEvent" in window,

    // contextMenu 只有Firefox支持
    contextMenu: "oncontextmenu" in docEl && "HTMLMenuItemElement" in window,

    classList: "classList" in docEl,

    placeholder: "placeholder" in util.create("input"),

    localStorage:
      "localStorage" in window &&
      !!window.localStorage &&
      assert.isNative(window.localStorage.setItem),

    sessionStorage:
      "sessionStorage" in window &&
      !!window.sessionStorage &&
      assert.isNative(window.sessionStorage.setItem),

    cookie: window.navigator.cookieEnabled,

    applicationCache: !!window.applicationCache,

    historyAPI: window.history && "pushState" in window.history,

    serviceWorker: "serviceWorker" in nav,

    webSocket: !!(
      window.MozWebSocket ||
      (window.WebSocket && window.WebSocket.prototype)
    ),

    webWorker: !!(window.Worker && window.Worker.prototype),

    eventSource: !!(window.EventSource && window.EventSource.prototype),

    // vw 或 vh
    viewportUnit: (function(el) {
      try {
        el.style.width = "1vw";
        var test = el.style.width !== "";
        return !!test;
      } catch (err) {
        return false;
      }
    })(util.create("dummy")),

    // rem
    remUnit: (function(el) {
      try {
        el.style.width = "1rem";
        var test = el.style.width !== "";
        return !!test;
      } catch (err) {
        return false;
      }
    })(util.create("dummy")),

    canvas: (function(el) {
      return !!(el.getContext && el.getContext("2d"));
    })(util.create("canvas")),

    svg:
      !!document.createElementNS &&
      !!document.createElementNS("http://www.w3.org/2000/svg", "svg")
        .createSVGRect,

    webGL: (function(el) {
      try {
        return !!(
          window.WebGLRenderingContext &&
          (el.getContext("webgl") || el.getContext("experimental-webgl"))
        );
      } catch (err) {
        return false;
      }
    })(util.create("canvas")),

    video: !!document.createElement("video").canPlayType,

    video_ogg: (function() {
      var video = document.createElement("video");
      // return !!vedio.canPlayType('video/ogg')
      return !!(
        video.canPlayType &&
        video.canPlayType('video/ogg; codecs="theora, vorbis"')
      );
    })(),

    video_mp4: (function() {
      var video = document.createElement("video");
      return !!(
        video.canPlayType &&
        video.canPlayType('video/mp4; codecs="avc1.4D401E, mp4a.40.2"')
      );
    })(),

    video_webm: (function() {
      var video = document.createElement("video");
      return !!(
        video.canPlayType &&
        video.canPlayType('video/webm; codecs="vp8.0, vorbis"')
      );
    })(),

    audio: !!document.createElement("audio").canPlayType,

    audio_ogg: (function() {
      var audio = document.createElement("audio");
      return !!(
        audio.canPlayType && audio.canPlayType('audio/ogg; codecs="vorbis"')
      );
    })(),

    audio_mp3: (function() {
      var audio = document.createElement("audio");
      return !!(audio.canPlayType && audio.canPlayType("audio/mpeg"));
    })(),

    audio_mp4: (function() {
      var audio = document.createElement("audio");
      return !!(
        audio.canPlayType && audio.canPlayType('audio/mp4; codecs="mp4a.40.5"')
      );
    })(),

    audio_wav: (function() {
      var audio = document.createElement("audio");
      return !!(
        audio.canPlayType && audio.canPlayType('audio/wav; codecs="1"')
      );
    })(),

    XHR: "XMLHttpRequest" in window,

    cors:
      "XMLHttpRequest" in window && "withCredentials" in new XMLHttpRequest(),

    fetch: !!window.fetch,

    touch: !!(
      "ontouchstart" in docEl ||
      (nav.msPointerEnabled && window.MSGesture) ||
      (window.DocumentTouch && document instanceof DocumentTouch)
    ),

    drag: (function() {
      var div = document.createElement("div");
      return "draggable" in div && "ondragstart" in div && "ondrop" in div;
    })(),

    eventSupported: (function() {
      var TAGNAMES = {
        select: "input",
        change: "input",
        submit: "form",
        reset: "form",
        error: "img",
        load: "img",
        abort: "img"
      };

      function isEventSupported(eventName, element) {
        element =
          element || document.createElement(TAGNAMES[eventName] || "div");
        eventName = "on" + eventName;

        var isSupported = eventName in element;

        if (!isSupported) {
          if (!element.setAttribute) {
            element = document.createElement("div");
          }
          if (element.setAttribute && element.removeAttribute) {
            element.setAttribute(eventName, "");
            isSupported = typeof element[eventName] === "function";

            if (typeof element[eventName] !== "undefined") {
              element[eventName] = undefined;
            }
            element.removeAttribute(eventName);
          }
        }

        element = null;
        return isSupported;
      }
      return isEventSupported;
    })(),

    async: "async" in util.create("script"),

    defer: "defer" in util.create("script"),

    geolocation: "geolocation" in nav,

    // img属性，定义了我们允许浏览器选择的图像集，以及每个图像的大小
    srcset: "srcset" in util.create("img"),

    // img属性，定义了一组媒体条件（屏幕的宽度）
    sizes: "sizes" in util.create("img"),

    pictureElement: "HTMLPictureElement" in window,

    extend: function(name, callback) {
      if (typeof callback !== "function") {
        throw new TypeError('Feature.extend: "callback" is not a Function');
      }

      this[name] = !!callback(util);
      return this;
    },

    testAll: function() {
      var testResult = "The browser supports these features:\n";
      var maxLength = 0;
      for (var test in this) {
        if (
          test !== "testAll" &&
          test !== "extend" &&
          typeof this[test] !== "function"
        ) {
          testResult += "\n" + test + ":\xa0" + this[test];
          if (test.length > maxLength) maxLength = test.length;
        }
      }

      testResult = testResult.replace(/\n(\w*:)/g, function(matchAll, match) {
        var emptyLength = maxLength + 2 - matchAll.length;
        var emptyArray = [];
        for (var i = 0; i < emptyLength; i++) {
          emptyArray.push("\xa0");
        }
        return "\n" + emptyArray.join("") + match;
      });

      return testResult;
    }
  };

  return feature;
});
