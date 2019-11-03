/*
 * @Author: gleeman
 * @Date: 2019-10-13 15:51:44
 * @LastEditors: gleeman
 * @LastEditTime: 2019-11-02 21:29:43
 * @Description: IE > 8
 */

such.define("router", ["assert", "event"], function(assert, event) {
  "use strict";

  function Router(routerMap) {
    this.routes = {};
    this.currentUrl = "";
    if (routerMap instanceof Object) {
      for (var key in routerMap) {
        if (
          routerMap.hasOwnProperty(key) &&
          assert.isFunction(routerMap[key])
        ) {
          this.routes[key] = routerMap[key].bind(routerMap);
        }
      }
    }
    this._init();
  }

  Router.prototype._init = function() {
    event.on(window, "load", this._update.bind(this), false);
    event.on(window, "hashchange", this._update.bind(this), false);
  };

  Router.prototype._update = function(arg) {
    this.currentUrl = location.hash.slice(1) || "/";
    var fn = this.routes[this.currentUrl];
    assert.isFunction(fn) && fn(this, arg);
  };

  Router.prototype.route = function(url) {
    window.location.replace(url);
  };

  Router.prototype.reload = function(flag) {
    window.location.reload(flag);
  };

  Router.prototype.go = function(num) {
    window.history.go(num);
  };

  Router.prototype.back = function() {
    window.history.back();
  };

  return Router;
});
