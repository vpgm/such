/*
 * @Author: gleeman
 * @Date: 2019-08-17 01:34:15
 * @LastEditors: gleeman
 * @LastEditTime: 2019-11-17 16:24:16
 * @Description: 支持尺寸、透明度、颜色(浏览器必须支持rgba模式)等属性渐变
 */

such.define("animate", ["assert", "error", "string", "color"], function(
  assert,
  error,
  string,
  color
) {
  "use strict";

  /*
	t: 时间间隔
	b: 起始位置
	c: 终止位置
	d: 总时间
*/

  var tween = {
    linear: function(t, b, c, d) {
      return ((c - b) * t) / d;
    },
    minusspeed: function(t, b, c, d) {
      return (2 * (c - b) * t) / d - ((c - b) * t * t) / (d * d);
    },
    easeInQuad: function(t, b, c, d) {
      return c * (t /= d) * t + b;
    },
    easeOutQuad: function(t, b, c, d) {
      return -c * (t /= d) * (t - 2) + b;
    },
    easeInOutQuad: function(t, b, c, d) {
      if ((t /= d / 2) < 1) return (c / 2) * t * t + b;
      return (-c / 2) * (--t * (t - 2) - 1) + b;
    },
    easeInCubic: function(t, b, c, d) {
      return c * (t /= d) * t * t + b;
    },
    easeOutCubic: function(t, b, c, d) {
      return c * ((t = t / d - 1) * t * t + 1) + b;
    },
    easeInOutCubic: function(t, b, c, d) {
      if ((t /= d / 2) < 1) return (c / 2) * t * t * t + b;
      return (c / 2) * ((t -= 2) * t * t + 2) + b;
    },
    easeInQuart: function(t, b, c, d) {
      return c * (t /= d) * t * t * t + b;
    },
    easeOutQuart: function(t, b, c, d) {
      return -c * ((t = t / d - 1) * t * t * t - 1) + b;
    },
    easeInOutQuart: function(t, b, c, d) {
      if ((t /= d / 2) < 1) return (c / 2) * t * t * t * t + b;
      return (-c / 2) * ((t -= 2) * t * t * t - 2) + b;
    },
    easeInQuint: function(t, b, c, d) {
      return c * (t /= d) * t * t * t * t + b;
    },
    easeOutQuint: function(t, b, c, d) {
      return c * ((t = t / d - 1) * t * t * t * t + 1) + b;
    },
    easeInOutQuint: function(t, b, c, d) {
      if ((t /= d / 2) < 1) return (c / 2) * t * t * t * t * t + b;
      return (c / 2) * ((t -= 2) * t * t * t * t + 2) + b;
    },
    easeInSine: function(t, b, c, d) {
      return -c * Math.cos((t / d) * (Math.PI / 2)) + c + b;
    },
    easeOutSine: function(t, b, c, d) {
      return c * Math.sin((t / d) * (Math.PI / 2)) + b;
    },
    easeInOutSine: function(t, b, c, d) {
      return (-c / 2) * (Math.cos((Math.PI * t) / d) - 1) + b;
    },
    easeInExpo: function(t, b, c, d) {
      return t == 0 ? b : c * Math.pow(2, 10 * (t / d - 1)) + b;
    },
    easeOutExpo: function(t, b, c, d) {
      return t == d ? b + c : c * (-Math.pow(2, (-10 * t) / d) + 1) + b;
    },
    easeInOutExpo: function(t, b, c, d) {
      if (t == 0) return b;
      if (t == d) return b + c;
      if ((t /= d / 2) < 1) return (c / 2) * Math.pow(2, 10 * (t - 1)) + b;
      return (c / 2) * (-Math.pow(2, -10 * --t) + 2) + b;
    },
    easeInCirc: function(t, b, c, d) {
      return -c * (Math.sqrt(1 - (t /= d) * t) - 1) + b;
    },
    easeOutCirc: function(t, b, c, d) {
      return c * Math.sqrt(1 - (t = t / d - 1) * t) + b;
    },
    easeInOutCirc: function(t, b, c, d) {
      if ((t /= d / 2) < 1) return (-c / 2) * (Math.sqrt(1 - t * t) - 1) + b;
      return (c / 2) * (Math.sqrt(1 - (t -= 2) * t) + 1) + b;
    },
    easeInElastic: function(t, b, c, d) {
      var s = 1.70158;
      var p = 0;
      var a = c;
      if (t == 0) return b;
      if ((t /= d) == 1) return b + c;
      if (!p) p = d * 0.3;
      if (a < Math.abs(c)) {
        a = c;
        var s = p / 4;
      } else var s = (p / (2 * Math.PI)) * Math.asin(c / a);
      return (
        -(
          a *
          Math.pow(2, 10 * (t -= 1)) *
          Math.sin(((t * d - s) * (2 * Math.PI)) / p)
        ) + b
      );
    },
    easeOutElastic: function(t, b, c, d) {
      var s = 1.70158;
      var p = 0;
      var a = c;
      if (t == 0) return b;
      if ((t /= d) == 1) return b + c;
      if (!p) p = d * 0.3;
      if (a < Math.abs(c)) {
        a = c;
        var s = p / 4;
      } else var s = (p / (2 * Math.PI)) * Math.asin(c / a);
      return (
        a * Math.pow(2, -10 * t) * Math.sin(((t * d - s) * (2 * Math.PI)) / p) +
        c +
        b
      );
    },
    easeInOutElastic: function(t, b, c, d) {
      var s = 1.70158;
      var p = 0;
      var a = c;
      if (t == 0) return b;
      if ((t /= d / 2) == 2) return b + c;
      if (!p) p = d * (0.3 * 1.5);
      if (a < Math.abs(c)) {
        a = c;
        var s = p / 4;
      } else var s = (p / (2 * Math.PI)) * Math.asin(c / a);
      if (t < 1)
        return (
          -0.5 *
            (a *
              Math.pow(2, 10 * (t -= 1)) *
              Math.sin(((t * d - s) * (2 * Math.PI)) / p)) +
          b
        );
      return (
        a *
          Math.pow(2, -10 * (t -= 1)) *
          Math.sin(((t * d - s) * (2 * Math.PI)) / p) *
          0.5 +
        c +
        b
      );
    },
    easeInBack: function(t, b, c, d, s) {
      if (s == undefined) s = 1.70158;
      return c * (t /= d) * t * ((s + 1) * t - s) + b;
    },
    easeOutBack: function(t, b, c, d, s) {
      if (s == undefined) s = 1.70158;
      return c * ((t = t / d - 1) * t * ((s + 1) * t + s) + 1) + b;
    },
    easeInOutBack: function(t, b, c, d, s) {
      if (s == undefined) s = 1.70158;
      if ((t /= d / 2) < 1)
        return (c / 2) * (t * t * (((s *= 1.525) + 1) * t - s)) + b;
      return (c / 2) * ((t -= 2) * t * (((s *= 1.525) + 1) * t + s) + 2) + b;
    },
    easeOutBounce: function(t, b, c, d) {
      if ((t /= d) < 1 / 2.75) {
        return c * (7.5625 * t * t) + b;
      } else if (t < 2 / 2.75) {
        return c * (7.5625 * (t -= 1.5 / 2.75) * t + 0.75) + b;
      } else if (t < 2.5 / 2.75) {
        return c * (7.5625 * (t -= 2.25 / 2.75) * t + 0.9375) + b;
      } else {
        return c * (7.5625 * (t -= 2.625 / 2.75) * t + 0.984375) + b;
      }
    }
  };

  var getStyleValue = function(dom, propertyName) {
    var ret = null;
    if (!dom || dom.nodeType !== 1) {
      error.error('"dom" must be a element.');
    }
    if (!assert.isString(propertyName)) {
      error.type('"propertyName" must be a string.');
    }
    if (dom.currentStyle) {
      ret = dom.currentStyle[propertyName];
    } else {
      ret = document.defaultView.getComputedStyle(dom, null)[propertyName];
    }
    if (ret === undefined) {
      if (propertyName === "opacity") {
        ret = 1;
      } else if (propertyName.match(/width|height|left|right|top|bottom/)) {
        try {
          ret = dom.getBoundingClientRect()[propertyName];
        } catch (e) {}
      }
    }
    return ret;
  };

  var Animate = function(dom) {
    if (!dom || dom.nodeType !== 1) {
      error.error('"dom" must be a element.');
    }
    this.dom = dom;
    this.startTime = 0;
    this.startPos = 0;
    this.endPos = 0;
    this.propertyName = "";
    this.propertyUnit = "";
    this.isColor = false;
    this.startRgba = null;
    this.endRgba = null;
    this.easing = tween["linear"];
    this.duration = 500;
    this.animateQueue = [];
  };

  Animate.tween = (function() {
    var arr = [];
    for (var key in tween) {
      if (tween.hasOwnProperty(key)) {
        arr.push(key);
      }
    }
    return arr;
  })();

  Animate.prototype.start = function(propertyName, endPos, duration, easing) {
    this.startTime = +new Date();
    this.propertyName = string.camelCase(propertyName || "");
    this.propertyUnit = "";
    this.startPos = getStyleValue(this.dom, this.propertyName);
    this.startRgba = color.toRGBA(this.startPos);
    this.endRgba = color.toRGBA(endPos);
    this.isColor =
      this.startRgba.mode !== "UNKNOWN" || this.endRgba.mode !== "UNKNOWN";
    if (!this.isColor) {
      if (
        assert.isString(this.startPos) &&
        this.startPos.match(/^\d+(?:\.\d+)?([^\d]+)$/)
      ) {
        this.propertyUnit = RegExp.$1;
      } else if (
        assert.isString(endPos) &&
        endPos.match(/^\d+(?:\.\d+)?([^\d]+)$/)
      ) {
        this.propertyUnit = RegExp.$1;
      }
      this.startPos = parseFloat(this.startPos);
      this.endPos = parseFloat(endPos);
      this.startRgba = null;
      this.endRgba = null;
    }
    this.duration = duration ? duration : 500;
    this.easing = easing && tween[easing] ? tween[easing] : tween["linear"];
    var self = this;
    var timeId = setInterval(function() {
      if (self._step() === false) {
        clearInterval(timeId);
        var next = null;
        while ((next = self.animateQueue.shift())) {
          next && next();
        }
      }
    }, 16);
    return this;
  };

  Animate.prototype._step = function() {
    var t = +new Date();
    if (t >= this.startTime + this.duration) {
      this.update(this.endPos);
      return false;
    }
    if (!this.isColor) {
      var pos = this.easing(
        t - this.startTime,
        this.startPos,
        this.endPos - this.startPos,
        this.duration
      );
      this.update(pos);
    } else {
      var r = this.easing(
        t - this.startTime,
        this.startRgba.r,
        this.endRgba.r - this.startRgba.r,
        this.duration
      );
      var g = this.easing(
        t - this.startTime,
        this.startRgba.g,
        this.endRgba.g - this.startRgba.g,
        this.duration
      );
      var b = this.easing(
        t - this.startTime,
        this.startRgba.b,
        this.endRgba.b - this.startRgba.b,
        this.duration
      );
      var a = this.easing(
        t - this.startTime,
        this.startRgba.a,
        this.endRgba.a - this.startRgba.a,
        this.duration
      );
      var newRGBA = color.rgba2RGBA(r, g, b, a);
      r = newRGBA.r;
      g = newRGBA.g;
      b = newRGBA.b;
      a = newRGBA.a;
      this.update(["rgba(", [r, g, b, a].join(","), ")"].join(""));
    }
  };

  Animate.prototype.update = function(pos) {
    this.dom.style[this.propertyName] = pos + this.propertyUnit;
  };

  Animate.prototype.next = function(propertyName, endPos, duration, easing) {
    var fn = this.start.bind(this, propertyName, endPos, duration, easing);
    this.animateQueue.push(fn);
    return this;
  };

  return Animate;
});
