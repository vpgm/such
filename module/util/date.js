/*
 * @Author: gleeman
 * @Date: 2019-08-17 01:34:15
 * @LastEditors: gleeman
 * @LastEditTime: 2019-09-13 20:22:01
 * @Description: 日期和时间处理方法的扩展
 */

such.define("date", ["assert", "error", "object"], function(
  assert,
  error,
  object
) {
  "use strict";
  
  var utils = {
    getFullYear: function(num) {
      var ret = NaN;
      num = Number(num);
      if (num >= 0 && num < 99) {
        var nYear = new Date().getFullYear();
        var cent = Math.floor(nYear / 100);
        var currYear = cent * 100 + num;
        ret = currYear > nYear ? currYear - 100 : currYear;
      } else if (num > 100) {
        ret = num;
      }
      return ret;
    },
    getWeekListRangeInfo: function() {
      var args = Array.prototype.slice.call(arguments);
      ["start", "end"].forEach(function(v, i) {
        if (!assert.isObjectLike(args[i])) {
          error.type('"' + v + '" must be a object.');
        }
      });

      var start = args[0],
        end = args[1];

      var ret = {
        type: "",
        format: "",
        start: null,
        end: null
      };
      if (start.year && end.year) {
        ret.type = "year";
        if (start.year > end.year) {
          var ex = utils.exchange(start, end);
          start = ex[0];
          end = ex[1];
        }
        ret.start = [start.year, 1, 1].join("/");
        ret.end = [end.year, 12, 31].join("/");
      }
      if (start.month && end.month) {
        ret.type = "month";
        if (start.year === end.year && start.month > end.month) {
          var ex = utils.exchange(start, end);
          start = ex[0];
          end = ex[1];
        }
        var monthdays = date.getMonthDays([end.year, end.month].join("/"));
        ret.start = [start.year, start.month, 1].join("/");
        ret.end = [end.year, end.month, monthdays].join("/");
      }
      if (start.date && end.date) {
        ret.type = "date";
        if (
          start.year === end.year &&
          start.month === end.month &&
          start.date > end.date
        ) {
          var ex = utils.exchange(start, end);
          start = ex[0];
          end = ex[1];
        }
        ret.start = [start.year, start.month, start.date].join("/");
        ret.end = [end.year, end.month, end.date].join("/");
      }

      if (ret.type) {
        ret.format = [ret.start, ret.end].join("-");
      }

      return ret;
    },
    exchange: function(a, b) {
      return { 0: b, 1: a };
    },
    month: [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31],
    season: [90, 91, 92, 92],
    dayStamp: 24 * 60 * 60 * 1000,
    weekListCache: {},
    weekCache: {}
  };

  var date = {
    // 时间戳id
    tsid: function(prefix) {
      if (assert.isNumber(prefix)) {
        prefix = String(prefix);
      }
      if (!assert.isString(prefix) || assert.isNaN(prefix)) {
        prefix = "";
      }
      return (
        prefix +
        String(new Date().getTime()) +
        String(Math.random()).substring(2, 10)
      );
    },
    // 日期时间id
    dtid: function(prefix, fmt) {
      if (assert.isNumber(prefix)) {
        prefix = String(prefix);
      }
      if (!assert.isString(prefix) || assert.isNaN(prefix)) {
        prefix = "";
      }
      if (!assert.isString(fmt)) {
        fmt = "yyyyMMddhhmmssS";
      }
      return prefix + this.format(fmt) + String(Math.random()).substring(2, 10);
    },
    // 是否是有效日期
    // IE8及以下浏览器 new Date('2019') => [date] NaN
    isValid: function(date) {
      var result = new Date(date).toString().toLowerCase();
      return !/^nan|invalid\sdate$/.test(result);
    },
    // 平年
    isNonLeapYear: function(date) {
      return !this.isLeapYear(date);
    },
    // 润年
    isLeapYear: function(date) {
      var year = /\d+/.test(date) && Number(date);
      !year && (year = (date ? new Date(date) : new Date()).getFullYear());
      return (
        (!assert.isNaN(year, true) && !(year % 400)) ||
        (!(year % 4) && !!(year % 100))
      );
    },
    // 在XX日期之后
    isAfter: function(date, after) {
      date = new Date(date);
      after = new Date(after);
      return date > after;
    },
    // 在XX日期之前
    isBefore: function(date, before) {
      date = new Date(date);
      before = new Date(before);
      return date < before;
    },
    // 在两个日期之间
    inRange: function(date, before, after) {
      date = new Date(date) * 1;
      before = new Date(before) * 1;
      after = new Date(after) * 1;
      var min = Math.min(before, after);
      return date === min || (date - before) * (date - after) < 0;
    },
    // 转化成日期对象
    toDate: function(date) {
      if (assert.isString(date)) {
        var result = this.query(date);
        var arr = [result.year, result.month, result.date];
        var filter = arr.filter(function(item) {
          return item > 0;
        });
        if (filter.length) date = filter.join("/");
      }
      return this.isValid(date) ? new Date(date) : new Date();
    },
    // 获取天数, 包含start但不包含end
    getDays: function(start, end) {
      start = new Date(start);
      end = new Date(end);
      return Math.ceil((end - start) / utils.dayStamp);
    },
    // 获取月份天数
    getMonthDays: function(string) {
      if (!assert.isString(string)) {
        error.type('"string" must be a string');
      }
      var year = NaN,
        month = NaN,
        days = NaN;
      var arr = string.split(/[^\d]/);
      arr.length && (year = parseInt(arr[0]));
      arr.length > 1 && (month = parseInt(arr[1]));
      if (year && month > 0 && month <= 12) {
        days =
          month == 2 && this.isLeapYear(year) ? 29 : utils.month[month - 1];
      }

      return days;
    },
    // 获取季度天数
    getSeasonDays: function(string) {
      if (!assert.isString(string)) {
        error.type('"string" must be a string');
      }
      var year = NaN,
        season = NaN;
      var arr = fmt.split(/[^\d]/);
      arr.length && (year = parseInt(arr[0]));
      arr.length > 1 && (season = Math.min(4, parseInt(arr[1])));
      return this.isLeapYear(year) && season === 1 ? 91 : utils.season[season];
    },
    // 获取全年天数
    getYearDays: function(year) {
      if (assert.isString(year) || assert.isNumber(year)) {
        year = parseInt(year);
      } else {
        !assert.isDate(year) && (year = new Date());
        year = year.getFullYear();
      }
      return this.isLeapYear(year) ? 366 : 365;
    },
    // 获取周数, 周数从本年第一个周一开始计算
    getWeek: function(date) {
      date = this.toDate(date);
      var _year = date.getFullYear();
      var _month = date.getMonth() + 1;
      var _date = date.getDate();
      var format = [_year, _month, _date].join("/");
      if (utils.weekCache[format]) return utils.weekCache[format];
      var start = new Date([_year, 1, 1].join("/"));
      var day = start.getDay();
      var week = 0;

      if (day !== 1) {
        day === 0 && (day = 7);
        start = new Date([_year, 1, 9 - day].join("/"));
      }
      if (date >= start) {
        week = Math.ceil(
          (date - start + utils.dayStamp) / (utils.dayStamp * 7)
        );
      }
      return (utils.weekCache[format] = week);
    },
    // 获取周列表
    getWeekList: function() {
      var args = Array.prototype.slice.call(arguments, 0, 2);
      var start, end;
      end = args.length ? this.toJSON(args.pop()) : this.toJSON(new Date());
      start = args.length
        ? this.toJSON(args.pop())
        : {
            year: end.year,
            month: 1,
            date: 1
          };
      var info = utils.getWeekListRangeInfo(start, end);
      var ret = {
        items: [],
        header: {},
        footer: {},
        total: 0
      };
      if (!info.type) return ret;
      if (utils.weekListCache[info.format])
        return utils.weekListCache[info.format];
      start = new Date(info.start);
      end = new Date(info.end);

      var day = start.getDay();
      var monday = null;
      var weekno = 0;
      var startFmt = "";
      var weekStart = {};
      var endFmt = "";
      var weekEnd = {};
      var text = "";
      if (day === 1) {
        monday = start;
        weekno = 1;
        weekStart = this.toJSON(monday);
        weekEnd = this.toJSON(new Date(monday * 1 + utils.dayStamp * 6));
        startFmt = [weekStart.year, weekStart.month, weekStart.date].join("/");
        endFmt = [weekEnd.year, weekEnd.month, weekEnd.date].join("/");
        text =
          "第" +
          weekno +
          "周 " +
          startFmt.replace(/\//, "-") +
          "到" +
          endFmt.replace(/\//, "-");
        ret.items.push({
          weekno: weekno,
          start: startFmt,
          end: endFmt,
          range: [startFmt, endFmt],
          format: [startFmt, endFmt].join("-"),
          text: text
        });
        ret.total = weekno;
        monday = new Date(monday * 1 + utils.dayStamp * 7);
      } else {
        day === 0 && (day = 7);
        monday = new Date(start * 1 + utils.dayStamp * (8 - day));
        if (monday > end) return (utils.weekListCache[info.format] = ret);
        weekStart = this.toJSON(new Date(monday * 1 - 7 * utils.dayStamp));
        weekEnd = this.toJSON(new Date(monday * 1 - utils.dayStamp));
        startFmt = [weekStart.year, weekStart.month, weekStart.date].join("/");
        endFmt = [weekEnd.year, weekEnd.month, weekEnd.date].join("/");
        ret.header.range = [info.start, endFmt];
        ret.header.format = [info.start, endFmt].join("-");
        ret.header.monday = startFmt;
        ret.header.sunday = endFmt;
      }

      while (monday <= end) {
        weekno = ret.items.length + 1;
        weekStart = this.toJSON(monday);
        weekEnd = this.toJSON(new Date(monday * 1 + utils.dayStamp * 6));
        startFmt = [weekStart.year, weekStart.month, weekStart.date].join("/");
        endFmt = [weekEnd.year, weekEnd.month, weekEnd.date].join("/");
        text =
          "第" +
          weekno +
          "周 " +
          startFmt.replace(/\//g, "-") +
          " 到 " +
          endFmt.replace(/\//g, "-");
        ret.items.push({
          weekno: weekno,
          start: startFmt,
          end: endFmt,
          range: [startFmt, endFmt],
          format: [startFmt, endFmt].join("-"),
          text: text
        });
        ret.total = weekno;

        monday = new Date(monday * 1 + utils.dayStamp * 7);
      }

      if (ret.items.length && monday - end > utils.dayStamp) {
        weekStart = this.toJSON(new Date(end * 1 + utils.dayStamp));
        weekEnd = this.toJSON(new Date(monday * 1 - utils.dayStamp));
        startFmt = [weekStart.year, weekStart.month, weekStart.date].join("/");
        endFmt = [weekEnd.year, weekEnd.month, weekEnd.date].join("/");
        ret.footer.range = [startFmt, endFmt];
        ret.footer.format = [startFmt, endFmt].join("-");
        ret.footer.monday = ret.items[ret.items.length - 1].start;
        ret.footer.sunday = endFmt;
      }

      return (utils.weekListCache[info.format] = ret);
    },
    // 字符串获取年月日时分秒
    query: function(string) {
      if (!assert.isString(string)) {
        error.type('"string" must be a string');
      }
      var ret = {
        year: NaN,
        month: NaN,
        date: NaN,
        hour: NaN,
        minute: NaN,
        second: NaN
      };
      var arr = string.split(/[^\d]/).filter(function(item) {
        return item !== "";
      });
      var len = arr.length;
      switch (len) {
        case 1:
          // 年
          ret.year = utils.getFullYear(arr[0]);
          break;
        case 2:
          // 年月
          var max = Math.max(arr[0], arr[1]);
          var min = Math.min(arr[0], arr[1]);
          if (max > 12) {
            ret.year = utils.getFullYear(max);
            if (min > 0 && min <= 12) ret.month = min;
          } else {
            arr[0] > 0 && (ret.month = arr[0]);
            ret.year = utils.getFullYear(arr[1]);
          }
          break;
        default:
          if (len >= 3) {
            // 年月日
            if (arr[0] > 12) {
              // y/M/d
              ret.year = utils.getFullYear(arr[0]);
              if (arr[1] > 0 && arr[1] <= 12) {
                ret.month = arr[1];
                var maxdays = this.getMonthDays(
                  [ret.year, ret.month].join("-")
                );
                if (arr[2] > 0 && arr[2] <= maxdays) ret.date = arr[2];
              }
            } else {
              // M/d/y
              ret.year = utils.getFullYear(arr[2]);
              if (arr[0] > 0 && arr[0] <= 12) {
                ret.month = arr[0];
                var maxdays = this.getMonthDays(
                  [ret.year, ret.month].join("-")
                );
                if (arr[1] > 0 && arr[1] <= maxdays) ret.date = arr[2];
              }
            }
            // 时分秒
            if (ret.date && len >= 4 && arr[3] < 24) {
              ret.hour = arr[3];
              if (len >= 5 && arr[4] < 60) {
                ret.minute = arr[4];
                if (len >= 6 && arr[5] < 60) {
                  ret.second = arr[5];
                }
              }
            }
          }
          break;
      }
      ret = object.map(ret, function(value) {
        return Number(value);
      });

      return ret;
    },
    // 获取年月日时分秒
    toJSON: function(string) {
      var ret = {
        year: NaN,
        month: NaN,
        date: NaN,
        hour: NaN,
        minute: NaN,
        second: NaN,
        season: NaN,
        week: NaN
      };
      assert.isNumber(string) && (string = String(string));
      if (assert.isString(string)) {
        ret = this.query(string);
      } else {
        !assert.isDate(string) && (string = new Date());
        ret.year = string.getFullYear();
        ret.month = string.getMonth() + 1;
        ret.date = string.getDate();
        ret.hour = string.getHours();
        ret.minute = string.getMinutes();
        ret.second = string.getSeconds();
      }
      // 季度
      ret.season = ret.month && Math.ceil(ret.month / 3);
      // 周数
      if (ret.year && ret.date && ret.date) {
        ret.week = this.getWeek([ret.year, ret.month, ret.date].join("/"));
      }
      return ret;
    },
    // 格式化日期
    format: function(fmt, date) {
      if (!fmt || !assert.isString(fmt)) {
        fmt = "yyyy-MM-dd";
      }
      date = this.toDate(date);
      var o = {
        "M+": date.getMonth() + 1, //月份
        "d+": date.getDate(), //日
        "h+": date.getHours(), //小时
        "m+": date.getMinutes(), //分
        "s+": date.getSeconds(), //秒
        "q+": Math.floor((date.getMonth() + 3) / 3), //季度
        S: date.getMilliseconds() //毫秒
      };
      if (/(y+)/.test(fmt))
        fmt = fmt.replace(
          RegExp.$1,
          (date.getFullYear() + "").substr(4 - RegExp.$1.length)
        );
      for (var k in o)
        if (new RegExp("(" + k + ")").test(fmt))
          fmt = fmt.replace(
            RegExp.$1,
            RegExp.$1.length == 1
              ? o[k]
              : ("00" + o[k]).substr(("" + o[k]).length)
          );
      return fmt;
    },
    // 计时器, 回调函数return true || false 停止计时
    counter: function(callback) {
      if (!assert.isFunction(callback)) {
        error.type('"callback" must be a function.');
      }
      var date,
        result,
        self = this;
      var timer = setInterval(function() {
        date = new Date();
        result = callback(self.toJSON(date));
        if (assert.isBoolean(result)) {
          clearInterval(timer);
          timer = null;
        }
      }, 1000);
    },
    // 倒计时, 回调函数return true || false 停止计时
    downcounter: function(date, callback) {
      if (!assert.isFunction(callback)) {
        error.type('"callback" must be a function.');
      }
      date = this.toDate(date);
      var now, result;
      var timer = setInterval(function() {
        now = new Date();
        if (now > date) {
          clearInterval(timer);
          timer = null;
          callback(null);
        } else {
          // 处理回调
          var json = {
            days: NaN,
            hours: NaN,
            minutes: NaN,
            seconds: NaN
          };
          json.seconds = Math.floor((date - now) / 1000);
          json.days = Math.floor(json.seconds / utils.dayStamp);
          json.seconds = json.seconds % utils.dayStamp;
          json.hours = Math.floor(json.seconds / 3600);
          json.seconds %= 3600;
          json.minutes = Math.floor(json.seconds / 60);
          json.seconds %= 60;
          result = callback(json);
          if (assert.isBoolean(result)) {
            clearInterval(timer);
            timer = null;
          }
        }
      }, 1000);
    }
  };

  return date;
});
