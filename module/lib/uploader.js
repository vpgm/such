/*
 * @Author: gleeman
 * @Date: 2019-08-17 01:34:15
 * @LastEditors: gleeman
 * @LastEditTime: 2019-11-17 18:48:11
 * @Description: 文件上传
 */

such.define("uploader", ["assert", "error"], function(assert, error) {
  "use strict";

  var noon = function() {};
  var invalidTypeArray = [
    "F_EXCEED_NUM",
    "F_EXCEED_SIZE",
    "F_EXCEED_TOTAL_SIZE",
    "Q_TYPE_DENIED"
  ];
  var unitObject = {
    "T|TB": 1024 * 1024 * 1024 * 1024,
    "G|GB": 1024 * 1024 * 1024,
    "M|MB": 1024 * 1024,
    "K|KB": 1024,
    B: 1
  };
  var getSize = function(str) {
    str = String(str);
    var num = parseFloat(str);
    var unit = str
      .replace(/^\d*(\.\d*)?/, "")
      .toUpperCase()
      .trim();
    var multiple = 1;
    for (var u in unitObject) {
      if (unitObject.hasOwnProperty(u)) {
        var reg = new RegExp("^(" + u + ")$");
        if (reg.test(unit)) {
          multiple = unitObject[u];
          break;
        }
      }
    }
    return Math.round(num * multiple);
  };
  var getAccept = function(str) {
    var ret = [];
    if (str) {
      ret = String(str)
        .split(",")
        .map(function(item) {
          return item.toLowerCase().replace(/\s/g, "");
        });
    }
    return ret;
  };

  function Uploader() {
    this.input = null;
    this.xhr = [];
    this.params = {};
    this.paramsConvertion = null;
    this.name = null;
    this.multiple = null;
    this.accept = null;
    this.timeout = 5 * 60 * 1000;
    this.fileNumLimit = 10;
    this.fileSizeLimit = 5 * 1024 * 1024;
    this.fileTotalSizeLimit = this.fileNumLimit * this.fileSizeLimit;
    this.records = [];
    this.timer = null;
    this.actions = {
      validator: noon,
      beforeUpload: noon,
      progress: noon,
      error: noon,
      complete: noon,
      timeout: noon,
      change: noon
    };
  }

  Uploader.prototype.init = function(options) {
    var me = this;
    if (!(options instanceof Object)) {
      error.error('"options" must be a object');
    }
    this.input =
      document.querySelector("#" + options.id || options.selector) ||
      options.input;
    if (
      !this.input ||
      this.input.nodeName.toLowerCase() !== "input" ||
      this.input.type !== "file"
    ) {
      error.error("it must provide a id, a selector or a input");
    }
    this.input.addEventListener(
      "change",
      function(e) {
        me.records = [];
        me.actions.change(e);
      },
      false
    );
    this.addListeners(options.actions);
    this.addParams(options.params);
    this.setParamsConvertion(options.paramsConvertion);
    [
      "name",
      "multiple",
      "accept",
      "timeout",
      "fileNumLimit",
      "fileSizeLimit",
      "fileTotalSizeLimit"
    ].forEach(function(item) {
      if (item in options) me[item] = options[item];
      if (item.match(/name|multiple|accept/) && me[item] !== null) {
        me.input.setAttribute(item, me[item]);
      }
    });
  };

  Uploader.prototype.upload = function(url) {
    var me = this;
    if (!this.input) {
      error.error("Uploader has not call init.");
    }

    if (!this.name) this.name = this.input.getAttribute("name");
    if (!this.multiple) this.multiple = this.input.getAttribute("multiple");
    if (!this.accept) this.accept = this.input.getAttribute("accept");

    var fliesList = this.input.files;
    var filesNum = fliesList.length;

    // 记录
    for (var n = 0; n < filesNum; n++) {
      var flag = this.records.some(function(item) {
        return item.file.name === fliesList[n].name;
      });
      if (!flag) {
        this.records.push({
          status: "start",
          unacceptable: false,
          file: fliesList[n]
        });
      }
    }

    var uploadQueue = this.records.filter(function(item) {
      return !item.status.match(/complete/);
    });

    // 验证
    var invalidType = "";
    var fileSizeTotal = 0;
    var fileSizeLimit = getSize(this.fileSizeLimit);
    var fileTotalSizeLimit = getSize(this.fileTotalSizeLimit);
    var accept = getAccept(this.accept);

    if (uploadQueue.length > this.fileNumLimit) {
      invalidType = invalidTypeArray[0];
    } else {
      for (var q = 0; q < uploadQueue.length; q++) {
        if (uploadQueue[q].file.size > fileSizeLimit) {
          invalidType = invalidTypeArray[1];
          break;
        }
        fileSizeTotal += uploadQueue[q].file.size;
        if (!invalidType && fileSizeTotal > fileTotalSizeLimit) {
          invalidType = invalidTypeArray[2];
          break;
        }
        uploadQueue[q].unacceptable = false;
        if (!invalidType && accept.length) {
          var flag = accept.some(function(item) {
            return item.indexOf(uploadQueue[q].file.type.split("/")[1]) > -1;
          });
          if (!flag) {
            uploadQueue[q].unacceptable = true;
            invalidType = invalidTypeArray[3];
            break;
          }
        }
      }
    }

    if (invalidType) {
      return this.actions.validator(invalidType);
    }

    var queueLength = uploadQueue.length;
    var progressArray = new Array(queueLength);
    var completeNum = 0;
    var completeResponseArray = new Array(queueLength);
    var errorCalled = false;
    var timeoutFlag = false;
    this.xhr = [];

    var flag = this.actions.beforeUpload(this.getInput(), uploadQueue);
    if (flag === true || flag === false) return;

    for (var i = 0; i < queueLength; i++) {
      !(function(i) {
        var formData = new FormData();
        formData.append(me.name, uploadQueue[i].file);
        for (var key in me.params) {
          if (me.params.hasOwnProperty(key)) {
            formData.append(key, me.params[key] || "");
          }
        }

        var newParams = assert.isFunction(me.paramsConvertion)
          ? me.paramsConvertion(formData)
          : formData;

        var xhr = new XMLHttpRequest();
        // progress
        xhr.upload.addEventListener(
          "progress",
          function(evt) {
            if (!timeoutFlag) {
              progressArray[i] = {
                progress: ((evt.loaded / evt.total) * 100).toFixed(2),
                event: evt,
                file: uploadQueue[i].file
              };
              me._progress(progressArray);
            }
          },
          false
        );
        // load
        xhr.addEventListener(
          "load",
          function(evt) {
            completeNum++;
            for (var r = 0; r < me.records.length; r++) {
              if (me.records[r].file === uploadQueue[i].file) {
                me.records[r].status = "complete";
                break;
              }
            }
            completeResponseArray[i] = {
              file: uploadQueue[i].file,
              event: evt,
              status: evt.target.status,
              response: evt.target.response
            };
            if (completeNum == queueLength && !timeoutFlag) {
              me._complete(completeResponseArray);
            }
          },
          false
        );
        // error
        xhr.addEventListener(
          "error",
          function(evt) {
            for (var r = 0; r < me.records.length; r++) {
              if (me.records[r].file === uploadQueue[i].file) {
                me.records[r].status = "error";
                break;
              }
            }
            if (!errorCalled && !timeoutFlag) {
              errorCalled = true;
              me._error(evt, uploadQueue[i].file);
            }
          },
          false
        );
        // abort
        xhr.addEventListener(
          "abort",
          function(evt) {
            if (!timeoutFlag) {
              me._abort(evt, uploadQueue[i].file);
            }
          },
          false
        );
        // open
        xhr.open("POST", url);
        // send
        xhr.send(newParams);
        me.xhr.push(xhr);
      })(i);
    }

    this.timer = setTimeout(function() {
      timeoutFlag = true;
      me.actions.timeout();
    }, this.timeout);
  };

  Uploader.prototype._progress = function(arr) {
    this.actions.progress(arr);
  };

  Uploader.prototype._complete = function(arr) {
    this._clearTimer();
    this.actions.complete(arr);
  };

  Uploader.prototype._abort = function(evt, file) {
    this._clearTimer();
    this.actions.abort(evt, file);
  };

  Uploader.prototype._error = function(error, file) {
    this._clearTimer();
    this.actions.error(error, file);
  };

  Uploader.prototype._clearTimer = function() {
    clearTimeout(this.timer);
    this.timer = null;
  };

  Uploader.prototype.addListener = function(action, fn) {
    if (assert.isString(action) && assert.isFunction(fn)) {
      this.actions[action] = fn;
    }
    return this;
  };

  Uploader.prototype.addListeners = function(actions) {
    if (actions instanceof Object && !assert.isFunction(actions)) {
      for (var key in actions) {
        if (actions.hasOwnProperty(key) && assert.isFunction(actions[key])) {
          this.actions[key] = actions[key];
        }
      }
    }
    return this;
  };

  Uploader.prototype.addParams = function(params) {
    if (params instanceof Object) {
      for (var key in params) {
        if (params.hasOwnProperty(key)) {
          this.params[key] = params[key] || "";
        }
      }
    }
    return this;
  };

  Uploader.prototype.setParamsConvertion = function(fn) {
    if (assert.isFunction(fn)) {
      this.paramsConvertion = fn;
    }
  };

  Uploader.prototype.getInput = function() {
    return this.input;
  };

  Uploader.prototype.getFiles = function() {
    return this.input && this.input.files;
  };

  Uploader.prototype.abort = function() {
    if (this.xhr && this.xhr.length) {
      this.xhr.forEach(function(item) {
        item.abort();
      });
    }
  };

  return Uploader;
});
