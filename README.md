## such
A lightweight, flexible, modular-based framework.

```html

<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="ie=edge">
  <title>such</title>
  <!-- 兼容ie8 -->
  <script src="such/ployfill.js" type="text/javascript"></script>
  <!-- 引入such -->
  <script src="such/index.js" type="text/javascript"></script>
</head>

<body>
  <div id="app">such</div>
  <script type="text/javascript">
    such.use(['date', 'string'], function (date, string) {
      var sdr = "His name is {{ name }} and his age is {{ age > 200 ? '年龄错误' : age + '岁' }}。";
      var url = "xxxx?user[name]=小明&user[age]=12&userid=2019825";

      console.log(string.camelCase(sdr, true));
      // HisNameIsNameAndHisAgeIsAge200Age
      console.log(string.snakeCase(sdr));
      // his_name_is_name_and_his_age_is_age_200_age
      console.log(string.query(url).user);
      // {name: "小明", age: "12"}
      console.log(string.compile(sdr, {name: '小明', age: 12}));
      // His name is 小明 and his age is 12岁。
    })
  </script>
</body>
</html>

```

```javascript

// 全局配置
such.config({
  dir: "./static/such/", // such核心模块路径
  base: "./static/expand/" // 扩展模块路径
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
such.use(["pinyin"}, function(pinyin) {
  var str = "不见南师久，谩说北群空。";
  
  console.log(pinyin.convertToPinyinString(str));
  // bújiànnánshījiǔ，mànshuōběiqúnkōng。
  console.log(pinyin.getShortPinyin(str));
  // b_j_n_s_j_m_s_b_q_k
})

```
