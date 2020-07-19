## such
A lightweight, flexible, modular-based framework.

```javascript

// 全局配置
such.config({
  keepAlive: true, // 模块加载后script元素保留
  dir: "./static/such/", // such核心模块路径
  expandDir: "./static/expand/", // 扩展模块路径
  version: true, // script元素添加版本号
  v: "1.1.0" // 版本号
})

// 如何定义一个模块
such.define("pinyin", ["assert", "error", "pinyinlite"], function(assert, error, pinyinlite) {
  var pinyin = {
    // => 拼音，默认带声调
    convertToPinyinString: function() {
      // ...
    },
    // => 拼音首字母
    getShortPinyin: function() {
      // ...
    }
  }
  
  return pinyin;
})

// 模块的使用
such.use(["pinyin"], function(pinyin) {
  var str = "不见南师久，谩说北群空。";
  
  console.log(pinyin.convertToPinyinString(str));
  // bújiànnánshījiǔ，mànshuōběiqúnkōng。
  console.log(pinyin.getShortPinyin(str));
  // b_j_n_s_j_m_s_b_q_k
})

```
