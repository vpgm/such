/*
 * @Author: gleeman
 * @Date: 2019-11-17 12:58:35
 * @LastEditors: gleeman
 * @LastEditTime: 2019-11-17 16:41:50
 * @Description: 颜色转换
 */

such.define("color", ["assert"], function(assert) {
  "use strict";

  var reg = {
    hex: /^#([\da-f]{3}|[\da-f]{6})$/,
    hslMode: /^(hsl(?:a)?)\([^)]*\)$/,
    hslValue: /^hsl(?:a)?\(([^)]*)\)$/,
    rgbMode: /^(rgb(?:a)?)\([^)]*\)$/,
    rgbValue: /^rgb(?:a)?\(([^)]*)\)$/
  };

  var webColorNames = {
    aliceblue: "#f0f8ff",
    antiquewhite: "#faebd7",
    aqua: "#00ffff",
    aquamarine: "#7fffd4",
    azure: "#f0ffff",
    beige: "#f5f5dc",
    bisque: "#ffe4c4",
    black: "#000000",
    blanchedalmond: "#ffebcd",
    blue: "#0000ff",
    blueviolet: "#8a2be2",
    brown: "#a52a2a",
    burlywood: "#deb887",
    cadetblue: "#5f9ea0",
    chartreuse: "#7fff00",
    chocolate: "#d2691e",
    coral: "#ff7f50",
    cornflowerblue: "#6495ed",
    cornsilk: "#fff8dc",
    crimson: "#dc143c",
    cyan: "#00ffff",
    darkblue: "#00008b",
    darkcyan: "#008b8b",
    darkgoldenrod: "#b8860b",
    darkgray: "#a9a9a9",
    darkgreen: "#006400",
    darkkhaki: "#bdb76b",
    darkmagenta: "#8b008b",
    darkolivegreen: "#556b2f",
    darkorange: "#ff8c00",
    darkorchid: "#9932cc",
    darkred: "#8b0000",
    darksalmon: "#e9967a",
    darkseagreen: "#8fbc8f",
    darkslateblue: "#483d8b",
    darkslategray: "#2f4f4f",
    darkturquoise: "#00ced1",
    darkviolet: "#9400d3",
    deeppink: "#ff1493",
    deepskyblue: "#00bfff",
    dimgray: "#696969",
    dodgerblue: "#1e90ff",
    feldspar: "#d19275",
    firebrick: "#b22222",
    floralwhite: "#fffaf0",
    forestgreen: "#228b22",
    fuchsia: "#ff00ff",
    gainsboro: "#dcdcdc",
    ghostwhite: "#f8f8ff",
    gold: "#ffd700",
    goldenrod: "#daa520",
    gray: "#808080",
    green: "#008000",
    greenyellow: "#adff2f",
    honeydew: "#f0fff0",
    hotpink: "#ff69b4",
    indianred: "#cd5c5c",
    indigo: "#4b0082",
    ivory: "#fffff0",
    khaki: "#f0e68c",
    lavender: "#e6e6fa",
    lavenderblush: "#fff0f5",
    lawngreen: "#7cfc00",
    lemonchiffon: "#fffacd",
    lightblue: "#add8e6",
    lightcoral: "#f08080",
    lightcyan: "#e0ffff",
    lightgoldenrodyellow: "#fafad2",
    lightgrey: "#d3d3d3",
    lightgreen: "#90ee90",
    lightpink: "#ffb6c1",
    lightsalmon: "#ffa07a",
    lightseagreen: "#20b2aa",
    lightskyblue: "#87cefa",
    lightslateblue: "#8470ff",
    lightslategray: "#778899",
    lightsteelblue: "#b0c4de",
    lightyellow: "#ffffe0",
    lime: "#00ff00",
    limegreen: "#32cd32",
    linen: "#faf0e6",
    magenta: "#ff00ff",
    maroon: "#800000",
    mediumaquamarine: "#66cdaa",
    mediumblue: "#0000cd",
    mediumorchid: "#ba55d3",
    mediumpurple: "#9370d8",
    mediumseagreen: "#3cb371",
    mediumslateblue: "#7b68ee",
    mediumspringgreen: "#00fa9a",
    mediumturquoise: "#48d1cc",
    mediumvioletred: "#c71585",
    midnightblue: "#191970",
    mintcream: "#f5fffa",
    mistyrose: "#ffe4e1",
    moccasin: "#ffe4b5",
    navajowhite: "#ffdead",
    navy: "#000080",
    oldlace: "#fdf5e6",
    olive: "#808000",
    olivedrab: "#6b8e23",
    orange: "#ffa500",
    orangered: "#ff4500",
    orchid: "#da70d6",
    palegoldenrod: "#eee8aa",
    palegreen: "#98fb98",
    paleturquoise: "#afeeee",
    palevioletred: "#d87093",
    papayawhip: "#ffefd5",
    peachpuff: "#ffdab9",
    peru: "#cd853f",
    pink: "#ffc0cb",
    plum: "#dda0dd",
    powderblue: "#b0e0e6",
    purple: "#800080",
    red: "#ff0000",
    rosybrown: "#bc8f8f",
    royalblue: "#4169e1",
    saddlebrown: "#8b4513",
    salmon: "#fa8072",
    sandybrown: "#f4a460",
    seagreen: "#2e8b57",
    seashell: "#fff5ee",
    sienna: "#a0522d",
    silver: "#c0c0c0",
    skyblue: "#87ceeb",
    slateblue: "#6a5acd",
    slategray: "#708090",
    snow: "#fffafa",
    springgreen: "#00ff7f",
    steelblue: "#4682b4",
    tan: "#d2b48c",
    teal: "#008080",
    thistle: "#d8bfd8",
    tomato: "#ff6347",
    turquoise: "#40e0d0",
    violet: "#ee82ee",
    violetred: "#d02090",
    wheat: "#f5deb3",
    white: "#ffffff",
    whitesmoke: "#f5f5f5",
    yellow: "#ffff00",
    yellowgreen: "#9acd32"
  };

  var color = {
    colorNames: webColorNames,
    hex2HEX: function(hex) {
      if (assert.isString(hex)) {
        hex = hex.toLowerCase().trim();
        if (hex && reg.hex.test(hex)) {
          hex = hex.replace("#", "");
          if (hex.length < 6) {
            var hexNew = ["#"],
              item,
              startIndex = hex.length * 2 - 6;
            for (var i = 0; i < hex.length; i++) {
              item = hex.charAt(i);
              if (i < startIndex) {
                hexNew.push(item);
              } else {
                hexNew.push(item, item);
              }
            }
            hex = hexNew.join("");
          }
        } else {
          hex = "";
        }
      } else {
        hex = "";
      }

      return hex;
    },
    hex2RGBA: function(hex) {
      var ret = {
        r: NaN,
        g: NaN,
        b: NaN,
        a: 1
      };

      hex = this.hex2HEX(hex).replace("#", "");
      if (hex) {
        ret.r = parseInt("0x" + hex.substring(0, 2));
        ret.g = parseInt("0x" + hex.substring(2, 4));
        ret.b = parseInt("0x" + hex.substring(4, 6));
      }

      return ret;
    },
    hsla2RGBA: function() {
      var ret = {
        r: NaN,
        g: NaN,
        b: NaN,
        a: 1
      };

      var args = [].slice.call(arguments, 0),
        h,
        s,
        l,
        a,
        r,
        g,
        b;

      if (args.length === 1) {
        var hsla = String(args[0])
          .toLowerCase()
          .trim();
        if (hsla.match(reg.hslValue)) {
          hsla = RegExp.$1;
          hsla = hsla.split(",");
          h = parseFloat(hsla[0]);
          s = parseFloat(hsla[1]);
          l = parseFloat(hsla[2]);
          a = parseFloat(hsla[3]);
        }
      } else {
        h = parseFloat(args[0]);
        s = parseFloat(args[1]);
        l = parseFloat(args[2]);
        a = parseFloat(args[3]);
      }

      if (h > 1) {
        h = (h % 360) / 360;
        if (h === 0) h = 1;
      } else if (h < 0) {
        h = 0;
      }
      if (s > 1) {
        s = (s % 100) / 100;
        if (s === 0) s = 1;
      } else if (s < 0) {
        s = 0;
      }
      if (l > 1) {
        l = (l % 100) / 100;
        if (l === 0) l = 1;
      } else if (l < 0) {
        l = 0;
      }
      if (a < 0 || a > 1 || assert.isNaN(a)) a = 1;

      if (s == 0) {
        r = g = b = l;
      } else {
        var hue2rgb = function hue2rgb(p, q, t) {
          if (t < 0) t += 1;
          if (t > 1) t -= 1;
          if (t < 1 / 6) return p + (q - p) * 6 * t;
          if (t < 1 / 2) return q;
          if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
          return p;
        };

        var q = l < 0.5 ? l * (1 + s) : l + s - l * s;
        var p = 2 * l - q;
        r = hue2rgb(p, q, h + 1 / 3);
        g = hue2rgb(p, q, h);
        b = hue2rgb(p, q, h - 1 / 3);
      }

      ret.r = Math.round(r * 255);
      ret.g = Math.round(g * 255);
      ret.b = Math.round(b * 255);
      ret.a = a;

      return ret;
    },
    rgba2RGBA: function() {
      var ret = {
        r: NaN,
        g: NaN,
        b: NaN,
        a: 1
      };

      var args = [].slice.call(arguments, 0),
        r,
        g,
        b,
        a;

      if (args.length === 1) {
        var rgba = String(args[0])
          .toLowerCase()
          .trim();
        if (rgba.match(reg.rgbValue)) {
          rgba = RegExp.$1;
          rgba = rgba.split(",");
          r = rgba[0];
          g = rgba[1];
          b = rgba[2];
          a = parseFloat(rgba[3]);
        }
      } else {
        r = args[0];
        g = args[1];
        b = args[2];
        a = parseFloat(args[3]);
      }

      if (assert.isString(r) && r.indexOf("%") > 0) {
        r = (parseFloat(r) / 100) * 255;
      }
      if (assert.isString(g) && g.indexOf("%") > 0) {
        g = (parseFloat(g) / 100) * 255;
      }
      if (assert.isString(b) && b.indexOf("%") > 0) {
        b = (parseFloat(b) / 100) * 255;
      }
      if (a < 0 || a > 1 || assert.isNaN(a)) a = 1;

      ret.r = Math.round(r);
      ret.g = Math.round(g);
      ret.b = Math.round(b);
      ret.a = a;

      return ret;
    },
    toRGBA: function(str) {
      var value,
        ret = {
          mode: "UNKNOWN",
          r: 0,
          g: 0,
          b: 0,
          a: 1,
          raw: str
        };

      str = String(str)
        .trim()
        .toLowerCase();

      if (webColorNames[str]) {
        ret.mode = "word";
        value = this.hex2RGBA(webColorNames[str]);
      } else if (str.match(reg.hex)) {
        ret.mode = "hex";
        value = this.hex2RGBA(str);
      } else if (str.match(reg.hslMode)) {
        ret.mode = RegExp.$1;
        value = this.hsla2RGBA(str);
      } else if (str.match(reg.rgbMode)) {
        ret.mode = RegExp.$1;
        value = this.rgba2RGBA(str);
      }

      such.assign(ret, value);

      return ret;
    },
    toHEX(str) {
      var value,
        rgb,
        ret = {
          mode: "UNKNOWN",
          value: "",
          raw: str
        };

      str = String(str)
        .trim()
        .toLowerCase();

      if (webColorNames[str]) {
        ret.mode = "word";
        ret.value = webColorNames[str];
      } else if (str.match(reg.hex)) {
        ret.mode = "hex";
        ret.value = this.hex2HEX(str);
      } else {
        if (str.match(reg.hslMode)) {
          ret.mode = RegExp.$1;
          value = this.hsla2RGBA(str);
        } else if (str.match(reg.rgbMode)) {
          ret.mode = RegExp.$1;
          value = this.rgba2RGBA(str);
        }
        if (value) {
          rgb = [
            value.r.toString(16),
            value.g.toString(16),
            value.b.toString(16)
          ];
          rgb.forEach(function(item, index) {
            if (item < 10) {
              rgb[index] = "0" + item;
            }
          });
          ret.value = "#" + rgb.join("");
        }
      }

      return ret;
    }
  };

  return color;
});
