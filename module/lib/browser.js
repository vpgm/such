/*
 * @Author: gleeman
 * @Date: 2019-07-13 11:42:00
 * @LastEditors: gleeman
 * @LastEditTime: 2019-09-13 20:22:28
 * @Description: 浏览器信息
 * @Todo：借鉴mysql语法来获得匹配结果，例如:
 * if <system> {{}} and {//} or ({{}} not {//}) then {{}}
 * if <engine> ...
 * if <name> ...
 * if <shell> ...
 */

such.define("browser", ["assert"], function(assert) {
  "use strict";

  // 缓存正则
  var cacheRegExp = {};
  // 内部工具方法
  var util = {
    versionRegExp: function(prefix, bool) {
      if (!prefix || !assert.isString(prefix)) prefix = "";
      var reg = prefix + "[\\s/]?([\\d._]+)";
      if (bool === false) reg += "?";
      return cacheRegExp[reg] || (cacheRegExp[reg] = new RegExp(reg));
    }
  };
  // 用户代理
  var navigator = window.navigator;
  var UA = navigator.userAgent;
  // \u0020 一个空格，Unicode字符
  var sp = "\u0020";
  var ua = UA.toLowerCase().replace(/\s{2,}/g, sp);
  var platform = navigator.platform && navigator.platform.toLowerCase();
  // 是否在微信平台
  var inWeex =
    !assert.isUndefined(window.WXEnvironment) &&
    !!window.WXEnvironment.platform;
  var weexPlatform = inWeex && window.WXEnvironment.platform.toLowerCase();
  // 是否在移动端(初步判断)
  var inMobile = !!ua.match(
    /(phone|pad|pod|iPhone|iPod|ios|iPad|Android|Mobile|BlackBerry|IEMobile|MQQBrowser|WebOS|Symbian|Windows Phone)/i
  );

  // 缓存浏览器信息
  var browserInfo = null;

  var browser = {
    /**
     * @description 是否被浏览器支持
     */
    isSupported: function(obj, callback) {
      if (assert.isFunction(callback)) {
        return callback(obj);
      }
      return !assert.isUndefined(window[obj]);
    },
    /**
     * @description 是否是PC端
     */
    inPC: !inMobile && !/\bmobile/.test(ua),
    /**
     * @description 是否是移动端
     */
    inMobile: inMobile || /\bmobile/.test(ua),
    /**
     * @description 是否是windows系统
     */
    inWindows: /\bwindows\s/.test(ua),
    /**
     * @description 是否是linux系统
     */
    inLinux: /\blinux/.test(ua),
    /**
     * @description 是否是mac系统
     */
    inMac: /\bmac\sos\sx/.test(ua),
    /**
     * @description 是否是Android系统
     */
    inAndroid: /\bandroid/.test(ua) || weexPlatform === "android",
    /**
     * @description 是否是IOS系统
     */
    inIOS:
      (/iphone|ipad|ipod|ios/.test(ua) && !/\bmac\sos\sx/.test(ua)) ||
      weexPlatform === "ios",
    /**
     * @description 是否是微信运行环境
     */
    inWeex: inWeex,
    /**
     * @description 是否是支付宝运行环境
     */
    inAlipay: /alipayclient/.test(ua),
    /**
     * @description 是否是IE浏览器环境
     */
    isIE: /\b(msie|trident)/.test(ua),
    /**
     * @description 是否是IE8浏览器环境
     */
    isIE8: /\bmsie\s8/.test(ua),
    /**
     * @description 是否是IE9浏览器环境
     */
    isIE9: /\bmsie\s9/.test(ua),
    /**
     * @description 是否是IE10浏览器环境
     */
    isIE10: /\bmsie\s10/.test(ua),
    /**
     * @description 是否是IE11浏览器环境
     */
    isIE11: /\btrident/.test(ua) && /\brv:\s?11/.test(ua),
    /**
     * @description 是否是Edge浏览器环境
     */
    isEdge: /\btrident/.test(ua) && /\bedge/.test(ua),

    /**
     * @description 是否是Chrome浏览器环境
     */
    isChrome: util.versionRegExp("\\bchrome").test(ua) && !/\bedge/.test(ua),
    /**
     * @description 是否是Safari浏览器环境
     */
    isSafari:
      util.versionRegExp("\\bsafari").test(ua) &&
      !util.versionRegExp("\\bchrome", false).test(ua),
    /**
     * @description 是否是Firefox浏览器环境
     */
    isFirefox: util.versionRegExp("\\bfirefox").test(ua),
    /**
     * @description 是否是Opera浏览器环境
     */
    isOpera: window.opera || !!ua.match(util.versionRegExp("\\b(opera|opr)")),
    /**
     * @description 获取浏览器名称、版本、内核、系统名称等
     */
    getBrowserInfo: function(userAgent) {
      // 参数过滤
      if (userAgent && !assert.isString(userAgent)) return null;
      !userAgent && (userAgent = "");
      userAgent = userAgent.toLowerCase().replace(/\s{2,}/g, sp);

      // 有缓存直接返回
      if (browserInfo && (!userAgent || browserInfo.ua === userAgent))
        return browserInfo;

      if (userAgent) ua = userAgent;

      var ret = {
        name: "unknown",
        engine: "unknown",
        system: "unknown",
        device: "unknown",
        shell: "none",
        version: -1,
        intVersion: -1,
        engineVersion: -1,
        shellVersion: -1,
        inMobile: false,
        platform: platform || "unknown",
        ua: ua,
        UA: UA
      };

      // system
      var windowsSystemMap = {
        "95": "95",
        "98": "98",
        "98 se": "98 se",
        ce: "ce",
        "9x 4.90": "me",
        me: "me",
        "nt 5.0": "2000",
        "nt 5.1": "xp",
        "nt 5.2": "2003",
        "nt 6.0": "vista",
        "nt 6.1": "7",
        "nt 6.2": "8",
        "nt 6.3": "8.1",
        "nt 6.4": "10 preview",
        "nt 10.0": "10"
      };

      if (ua.match(/\bwindows\s(phone|mobile)/)) {
        ret.system = "windows " + RegExp.$1;
        ret.inMobile = true;
      } else if (ua.match(/\bwindows\s(\w+\s[\d._]+)?/)) {
        var systemMatch = RegExp.$1;
        systemMatch && (systemMatch = systemMatch.replace(/(^\s*|\s*$)/g, ""));
        ret.system = "windows " + (windowsSystemMap[systemMatch] || "unknown");
      } else if (ua.match(/\bmac\sos\sx/)) {
        ret.system = "mac";
      } else if (ua.match(/\b(iphone|ipod|ipad|ios)/)) {
        ret.system = "ios";
      } else if (
        ua.match(/\b(android|nokian|webos|symbianos|blackberry|yunos|kaios)/)
      ) {
        ret.system = RegExp.$1;
        ret.inMobile = true;
      } else if (ua.match(/\b(linux|freebsd|solaris)/)) {
        ret.system = RegExp.$1;
      }

      // engine version
      if (
        ua.match(
          util.versionRegExp("\\b(trident|applewebkit|gecko|presto|khtml)")
        )
      ) {
        var engineMatch = RegExp.$1;
        engineMatch === "applewebkit" && (engineMatch = "webkit");
        ret.engine = engineMatch;
        ret.engineVersion = RegExp.$2;
      } else if (ua.match(util.versionRegExp("\\bchrome"))) {
        ret.engine = "blink";
        ret.engineVersion = RegExp.$1;
      }

      // name version
      if (ua.match(util.versionRegExp("\\bmsie"))) {
        var versionMatch = parseInt(RegExp.$1);
        var versionProbably = parseInt(ret.engineVersion) + 4;
        ret.name = "IE" + versionMatch;
        ret.version = versionMatch;
        // IE8/9/10/11兼容模式
        if (ret.engine === "trident" && versionMatch < versionProbably) {
          ret.name = "IE" + versionProbably + "-";
          ret.version = versionProbably;
        }
      } else if (
        ret.engine === "trident" &&
        ua.match(util.versionRegExp("\\brv\\b:"))
      ) {
        var versionMatch = parseInt(RegExp.$1);
        ret.name = "IE" + versionMatch;
        ret.version = versionMatch;
      } else if (
        ret.engine === "trident" &&
        ua.match(util.versionRegExp("\\bedge"))
      ) {
        ret.name = "Edge";
        ret.version = RegExp.$1;
      } else if (
        ret.engine === "webkit" &&
        ua.match(util.versionRegExp("\\bsafari")) &&
        !ua.match(util.versionRegExp("\\bchrome"))
      ) {
        var safariV1 = ua.match(util.versionRegExp("\\bsafari"));
        var safariV2 = ua.match(util.versionRegExp("\\bversion"));
        ret.name = "Safari";
        ret.version = (safariV2 && safariV2[1]) || "V" + safariV1[1];
      } else if (
        ret.engine === "webkit" &&
        !ua.match(util.versionRegExp("\\b(chromium|opera|opr)")) &&
        ua.match(util.versionRegExp("\\b(chrome|crios)"))
      ) {
        ret.name = "Chrome";
        var chromeV1 = RegExp.$2;
        var chromeV2 = ua.match(util.versionRegExp("\\bversion"));
        ret.version = (chromeV2 && chromeV2[1]) || chromeV1;
      } else if (
        ua.match(util.versionRegExp("\\b(chromium|firefox|konqueror)"))
      ) {
        var nameMatch = RegExp.$1;
        ret.name = nameMatch[0].toUpperCase() + nameMatch.slice(1);
        ret.version = RegExp.$2;
      } else if (
        window.opera ||
        ua.match(util.versionRegExp("\\b(opera|opr)"))
      ) {
        var operaV0 =
          window.opera && window.opera.version && window.opera.version();
        var operaV1 = ua.match(util.versionRegExp("\\bopera"));
        var operaV2 = ua.match(util.versionRegExp("\\bopr"));
        var operaV3 = ua.match(util.versionRegExp("\\bversion"));
        var chromeV4 = ua.match(util.versionRegExp("\\bchrome"));
        // 引擎为webkit进行修正
        if (ret.engine === "webkit") {
          ret.name = "Chrome";
          ret.version = (operaV3 && operaV3[1]) || chromeV4[1];
          ret.shell = "opera";
          ret.shellVersion = operaV0 || operaV2[1] || operaV1[1];
        } else {
          ret.name = "Opera";
          ret.version =
            operaV0 || (operaV3 && operaV3[1]) || operaV2[1] || operaV1[1];
        }
      }

      // shell
      var shellMap = {
        "se && metasr": "sougou",
        "360?": "360",
        theworld: "theworld",
        maxthon: "maxthon",
        baidubrowser: "baidu",
        qq: "qq",
        qqbrowser: "qq",
        mqqbrowser: "qq",
        tencenttraveler: "tt",
        micromessenger: "weex",
        alipayclient: "alipay",
        taobrowser: "taobao",
        ucweb: "uc",
        ubrowser: "uc",
        lbbrowser: "liebao",
        greenbrowser: "green",
        "avant browser": "avant"
      };

      if (
        ua.match(util.versionRegExp("\\bmetasr")) &&
        ua.match(util.versionRegExp("\\bse"))
      ) {
        // sogou
        ret.shell = "sougou";
        ret.shellVersion = RegExp.$1;
      } else if (
        ua.match(
          util.versionRegExp(
            "\\b(theworld|maxthon|baidubrowser|qq|qqbrowser|mqqbrowser|tencenttraveler|micromessenger|alipayclient|taobrowser|ucweb|ubrowser|lbbrowser|greenbrowser|avant\\sbrowser)",
            false
          )
        )
      ) {
        var shellMatch = RegExp.$1;
        ret.shell = shellMap[shellMatch];
        ret.shellVersion = RegExp.$2 || -1;
        if (shellMatch === "mqqbrowser") ret.inMobile = true;
      } else {
        // 360
        if (ua.match(/\b360(ee|se)/)) {
          ret.shell = "360" + RegExp.$1;
        } else {
          var mimeTypes = navigator.mimeTypes;
          var mimeType360 = "application/vnd.chromium.remoting-viewer";
          if (
            mimeTypes &&
            (mimeType360 in mimeTypes ||
              (mimeTypes.indexOf && mimeTypes.indexOf(mimeType360)))
          ) {
            ret.shell = "360";
          }
        }
      }

      if (ret.shell === "none") {
        ret.shell = ret.name.toLowerCase();
        ret.shellVersion = ret.version;
      }

      // device
      if (ua.match(/\b(iphone|ipod|ipad)\b/)) {
        ret.device = RegExp.$1;
      }

      // inMobile
      if (ua.match(/\b(ie)?mobile/)) ret.inMobile = true;

      // intVersion
      if (ret.version !== -1) ret.intVersion = parseInt(ret.version);

      return (browserInfo = ret);
    }
  };

  return browser;
});
