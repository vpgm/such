/*
 * @Author: gleeman
 * @Date: 2019-10-13 15:51:44
 * @LastEditors: gleeman
 * @LastEditTime: 2019-11-04 20:39:59
 * @Description:
 */

such.define("event", ["assert"], function(assert) {
  "use strict";

  var event = {
    on: function(el, type, handler, flag) {
      if (window.addEventListener) {
        this.on = function(el, type, handler, flag) {
          el.addEventListener(type, handler, !!flag);
        };
      } else if (window.attachEvent) {
        this.on = function(el, type, handler) {
          el.attachEvent("on" + type, handler);
        };
      } else {
        this.on = function(el, type, handler) {
          el["on" + type] = handler;
        };
      }
      this.on(el, type, handler, flag);
    },
    off: function(el, type, handler) {
      if (window.removeEventListener) {
        this.off = function(el, type, handler) {
          el.removeEventListener(type, handler);
        };
      } else if (window.detachEvent) {
        this.off = function(el, type, handler) {
          el.detachEvent("on" + type, handler);
        };
      } else {
        this.off = function(el, type) {
          el["on" + type] = null;
        };
      }
      this.off(el, type, handler);
    },
    once: function(el, type, handler) {
      var _self = this;
      function wrap(e) {
        handler(e);
        _self.off(el, type, wrap);
      }
      this.on(el, type, wrap, false);
    },
    stop: function(event) {
      if (event.stopPropagation) {
        this.stop = function(event) {
          event.stopPropagation();
        };
      } else {
        this.stop = function(event) {
          event.cancelBubble = true;
        };
      }
      this.stop(event);
    },
    prevent: function(event) {
      if (event.preventDefault) {
        this.prevent = function(event) {
          event.preventDefault();
        };
      } else {
        this.prevent = function(event) {
          event.returnValue = false;
        };
      }
      this.prevent(event);
    },
    getEvent: function(event) {
      return event ? event : window.event;
    },
    getTarget: function(event) {
      return event.target || event.srcElement;
    },
    manager: function() {
      var eventsStore = {};

      var manager = {
        listen: function(name, fn) {
          if (!eventsStore[name]) {
            eventsStore[name] = [];
          }
          assert.isFunction(fn) && eventsStore[name].push(fn);
        },
        remove: function(name, fn) {
          var fnsArray = eventsStore[name] || [];
          if (assert.isFunction(fn)) {
            for (var i = 0; i < fnsArray.length; i++) {
              if (fnsArray[i] === fn) {
                fnsArray.splice(i, 1);
                break;
              }
            }
          } else {
            eventsStore[name] = [];
          }
        },
        fire: function(name, fn) {
          var fnsArray = eventsStore[name] || [];
          var flag = assert.isFunction(fn);
          var args = [].slice.call(arguments, flag ? 2 : 1);
          for (var i = 0; i < fnsArray.length; i++) {
            if (!flag) {
              fnsArray[i].apply(null, args);
            } else if (fnsArray[i] === fn) {
              fn.apply(null, args);
              break;
            }
          }
        }
      };

      return manager;
    },
    // 触发自定义事件 IE <= 8 不支持自定义事件，但支持dom0级事件
    dispatchEvent: function(element, event, data) {
      if (document.dispatchEvent) {
        var evt;
        try {
          evt = new CustomEvent(event, {
            detail: {
              data: data
            }
          });
        } catch (e) {
          evt = document.createEvent("HTMLEvents");
          evt.initEvent(event, true, true);
          !evt.detail && (evt.detail = {});
          evt.detail.data = data;
        }
        return element.dispatchEvent(evt);
      } else if (document.createEventObject) {
        try {
           // IE浏览器支持fireEvent方法 ()
          var evt = document.createEventObject();
          !evt.detail && (evt.detail = {});
          evt.detail.data = data;
          return element.fireEvent("on" + event);
        } catch(e) {}
      }
    },
    // 触发键盘事件
    dispatchKeyEvent: function(el, eventType, keyCode) {
      var doc = el.ownerDocument,
        win = doc.defaultView || doc.parentWindow,
        evtObj;
      if (doc.createEvent) {
        if (win.KeyEvent) {
          evtObj = doc.createEvent("KeyEvents");
          evtObj.initKeyEvent(
            eventType,
            true,
            true,
            win,
            false,
            false,
            false,
            false,
            keyCode,
            0
          );
        } else {
          evtObj = doc.createEvent("UIEvents");
          Object.defineProperty(evtObj, "keyCode", {
            get: function() {
              return this.keyCodeVal;
            }
          });
          Object.defineProperty(evtObj, "which", {
            get: function() {
              return this.keyCodeVal;
            }
          });
          evtObj.initUIEvent(eventType, true, true, win, 1);
          evtObj.keyCodeVal = keyCode;
          if (evtObj.keyCode !== keyCode) {
          }
        }
        el.dispatchEvent(evtObj);
      } else if (doc.createEventObject) {
        evtObj = doc.createEventObject();
        evtObj.keyCode = keyCode;
        el.fireEvent("on" + eventType, evtObj);
      }
    }
  };

  return event;
});
