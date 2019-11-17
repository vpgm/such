/*
 * @Author: gleeman
 * @Date: 2019-08-17 01:34:15
 * @LastEditors: gleeman
 * @LastEditTime: 2019-11-17 18:48:11
 * @Description: todo: 优化
 */

such.define("uploader", function() {
  "use strict";

  function Uploader() {
    /**
     * 对应input对象
     */
    var fileInput;
    /**
     * 全局回调函数,外部传入
     */
    var onUploading, onSuccess, onFailed, onCanceled;
    /**
     * FormData对象,存储将上传的文件跟附带信息，附带信息以键值对形式存放
     */
    var formData = new FormData();
    /**
     * 核心上传类
     */
    var xhr = new XMLHttpRequest();
    /**
     * 初始化文件上传对象 emId为input [type = file]的Id
     */
    this.bindFiles = function(emId) {
      fileInput = document.getElementById(emId);
      fileInput.onchange = function() {
        var files = fileInput.files;
        if (files) {
          var fileSize = 0;
          for (var i in files) {
            fileSize += files[i].size;
          }
          if (fileSize > 1024 * 1024 * 1024) {
            fileSize =
              (
                Math.round((fileSize * 100) / (1024 * 1024 * 1024)) / 100
              ).toString() + "G";
          } else if (fileSize > 1024 * 1024 && fileSize < 1024 * 1024 * 1024) {
            fileSize =
              (Math.round((fileSize * 100) / (1024 * 1024)) / 100).toString() +
              "M";
          } else if (fileSize > 1024 && fileSize < 1024 * 1024) {
            fileSize =
              (Math.round((fileSize * 100) / 1024) / 100).toString() + "K";
          } else {
            fileSize = Math.round(fileSize).toString() + "B";
          }
        } else {
        }
      };
    };
    /**
     * 上传文件
     */
    this.upload = function(url) {
      var name = fileInput.getAttribute("name");
      var fileLists = fileInput.files;
      if (fileLists) {
        for (var i in fileLists) {
          formData.append(name, fileLists[i]);
        }
      }

      xhr.upload.addEventListener("progress", this.onProgress, false);
      xhr.addEventListener("load", this.onComplete, false);
      xhr.addEventListener("error", this.onFailed, false);
      xhr.addEventListener("abort", this.onCanceled, false);
      xhr.open("POST", url);
      xhr.send(formData);
    };
    /**
     * 取消上传
     */
    this.cancel = function() {
      xhr.abort();
    };
    /**
     * 文件上传中
     */
    this.onProgress = function(evt) {
      if (evt.lengthComputable) {
        var percentComplete = Math.ceil((evt.loaded * 100) / evt.total) + "%";
        var resp = {
          loader: evt.loaded,
          total: evt.total,
          percent: percentComplete
        };
        if (onUploading) {
          onUploading(resp);
        }
      } else {
        if (onUploading) {
          onUploading("unable to compute");
        }
      }
    };
    /**
     * 文件上传完毕
     */
    this.onComplete = function(evt) {
      if (onSuccess) {
        onSuccess(evt.target.responseText);
      }
    };
    /**
     * 文件上传失败
     */
    this.onFailed = function(evt) {
      if (onFailed) {
        onFailed("failed");
      }
    };
    /**
     * 文件取消上传
     */
    this.onCanceled = function(evt) {
      if (onCanceled) {
        onCanceled("canceled");
      }
    };
    /**
     * 设置上传时附带的键值对信息
     */
    this.setParams = function(params) {
      if (params instanceof Object) {
        for (var key in params) {
          if (params.hasOwnProperty(key)) {
            formData.append(key, params[key] || "");
          }
        }
      }
    };
    /**
     * 设置上传过程回调监听
     */
    this.setOnUploadingListener = function(callback) {
      onUploading = callback;
    };
    /**
     * 设置上传成功回调监听
     */
    this.setOnSuccessListener = function(callback) {
      onSuccess = callback;
    };
    /**
     * 设置上传失败回调监听
     */
    this.setOnFailedListener = function(callback) {
      onFailed = callback;
    };
    /**
     * 设置取消上传回调监听
     */
    this.setOnCanceledListener = function(callback) {
      onCanceled = callback;
    };
  }

  return Uploader;
});
